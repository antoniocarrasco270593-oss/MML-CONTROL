from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, security, database

# Create Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MML-CONTROL API")

# --- AUTO-CREATE ADMIN ON STARTUP (For Render Ephemeral FS) ---
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(models.User).filter(models.User.email == "admin@fichaje.com").first()
        if not admin:
            # Create Admin
            hashed_pw = security.get_password_hash("admin123")
            admin = models.User(
                email="admin@fichaje.com",
                full_name="Admin Antonio",
                hashed_password=hashed_pw,
                role="admin",
                is_active=True,
                worker_number=999
            )
            db.add(admin)
            db.commit()
            print(">>> MML-SYSTEM: Admin user auto-created (admin@fichaje.com)")
    except Exception as e:
        print(f">>> MML-SYSTEM: Error creating admin: {e}")
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except security.JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        full_name=user.full_name, 
        hashed_password=hashed_password,
        worker_number=user.worker_number,
        vehicle_type=user.vehicle_type if hasattr(user, 'vehicle_type') else "car"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- SHIFT LOGIC ---

@app.post("/shifts/start", response_model=schemas.Shift)
def start_shift(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if already active
    active = db.query(models.Shift).filter(models.Shift.user_id == current_user.id, models.Shift.status == "active").first()
    if active:
        raise HTTPException(status_code=400, detail="You already have an active shift")
    
    new_shift = models.Shift(user_id=current_user.id)
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift

@app.post("/shifts/end", response_model=schemas.Shift)
def end_shift(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    active_shift = db.query(models.Shift).filter(models.Shift.user_id == current_user.id, models.Shift.status == "active").first()
    if not active_shift:
        raise HTTPException(status_code=400, detail="No active shift found")
    
    active_shift.end_time = datetime.utcnow()
    active_shift.status = "completed"
    db.commit()
    db.refresh(active_shift)
    return active_shift

@app.post("/location")
def record_location(loc: schemas.LocationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # CRITICAL: PRIVACY CHECK
    active_shift = db.query(models.Shift).filter(models.Shift.user_id == current_user.id, models.Shift.status == "active").first()
    if not active_shift:
        # We start by returning 403 Forbidden to indicate tracking is not allowed
        raise HTTPException(status_code=403, detail="Tracking disabled: No active shift")
    
    new_loc = models.LocationLog(shift_id=active_shift.id, latitude=loc.latitude, longitude=loc.longitude)
    db.add(new_loc)
    db.commit()
    return {"status": "recorded"}

@app.get("/admin/workers-map")
def get_live_workers(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Determine admin permission (simplified for now)
    # Get all active shifts
    active_shifts = db.query(models.Shift).filter(models.Shift.status == "active").all()
    results = []
    for shift in active_shifts:
        # Get last location
        last_loc = db.query(models.LocationLog).filter(models.LocationLog.shift_id == shift.id).order_by(models.LocationLog.timestamp.desc()).first()
        if last_loc:
            results.append({
                "user": shift.worker.full_name,
                "worker_number": shift.worker.worker_number, # Send the number
                "vehicle_type": shift.worker.vehicle_type,  # Send vehicle type
                "lat": last_loc.latitude,
                "lng": last_loc.longitude,
                "last_update": last_loc.timestamp
            })
    return results

@app.get("/admin/workers", response_model=list[schemas.User])
def get_all_workers(db: Session = Depends(get_db)):
    # In a real app we would check if current_user.role == "ADMIN"
    return db.query(models.User).all()

@app.get("/admin/shifts")
def get_all_shifts(db: Session = Depends(get_db)):
    shifts = db.query(models.Shift).all()
    # Enrich with worker name manually for simplicity or use Pydantic schema with ORM mode
    results = []
    for s in shifts:
        results.append({
            "id": s.id,
            "worker_name": s.worker.full_name,
            "worker_number": s.worker.worker_number,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "status": s.status
        })
    return results

# --- NEW ADVANCED ENDPOINTS ---

# DELETE Worker
@app.delete("/admin/workers/{worker_id}")
def delete_worker(worker_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    worker = db.query(models.User).filter(models.User.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    # Delete worker
    db.delete(worker)
    db.commit()
    return {"message": "Worker deleted successfully"}

# Open Shifts Alerts
@app.get("/admin/alerts/open_shifts")
def get_open_shifts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from datetime import timedelta
    threshold_time = datetime.utcnow() - timedelta(hours=12)
    
    open_shifts = db.query(models.Shift).filter(
        models.Shift.status == "active",
        models.Shift.start_time < threshold_time
    ).all()
    
    results = []
    for s in open_shifts:
        results.append({
            "id": s.id,
            "worker_name": s.worker.full_name,
            "worker_number": s.worker.worker_number,
            "start_time": s.start_time,
            "hours_open": (datetime.utcnow() - s.start_time).total_seconds() / 3600
        })
    return results

# Hours Summary Report
@app.get("/admin/reports/hours_summary")
def get_hours_summary(
    worker_id: int = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(models.Shift).filter(models.Shift.status == "completed")
    
    if worker_id:
        query = query.filter(models.Shift.user_id == worker_id)
    if start_date:
        query = query.filter(models.Shift.start_time >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(models.Shift.start_time <= datetime.fromisoformat(end_date))
    
    shifts = query.all()
    
    # Group by worker
    summary = {}
    for s in shifts:
        if s.worker.id not in summary:
            summary[s.worker.id] = {
                "worker_name": s.worker.full_name,
                "worker_number": s.worker.worker_number,
                "total_hours": 0,
                "shift_count": 0
            }
        
        if s.end_time:
            duration = (s.end_time - s.start_time).total_seconds() / 3600
            summary[s.worker.id]["total_hours"] += duration
            summary[s.worker.id]["shift_count"] += 1
    
    return list(summary.values())

# Company Settings
@app.get("/admin/company_settings")
def get_company_settings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = db.query(models.CompanySettings).first()
    if not settings:
        settings = models.CompanySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.post("/admin/company_settings")
def update_company_settings(
    company_name: str = None,
    company_cif: str = None,
    company_address: str = None,
    company_logo_url: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = db.query(models.CompanySettings).first()
    if not settings:
        settings = models.CompanySettings()
        db.add(settings)
    
    if company_name:
        settings.company_name = company_name
    if company_cif:
        settings.company_cif = company_cif
    if company_address:
        settings.company_address = company_address
    if company_logo_url:
        settings.company_logo_url = company_logo_url
    
    db.commit()
    db.refresh(settings)
    return settings

# Temporal Views - Daily/Weekly/Monthly
@app.get("/admin/shifts/daily/{date}")
def get_daily_shifts(date: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from datetime import datetime, timedelta
    target_date = datetime.fromisoformat(date)
    next_day = target_date + timedelta(days=1)
    
    shifts = db.query(models.Shift).filter(
        models.Shift.start_time >= target_date,
        models.Shift.start_time < next_day
    ).all()
    
    results = []
    for s in shifts:
        duration = None
        if s.end_time:
            duration = (s.end_time - s.start_time).total_seconds() / 3600
        
        results.append({
            "id": s.id,
            "worker_name": s.worker.full_name,
            "worker_number": s.worker.worker_number,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "duration_hours": duration,
            "status": s.status,
            "start_lat": s.start_location_lat,
            "start_lon": s.start_location_lon,
            "end_lat": s.end_location_lat,
            "end_lon": s.end_location_lon
        })
    return results

@app.get("/admin/shifts/weekly/{year}/{week}")
def get_weekly_shifts(year: int, week: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from datetime import datetime, timedelta
    # Calculate first day of week
    jan_1 = datetime(year, 1, 1)
    start_of_week = jan_1 + timedelta(weeks=week-1, days=-jan_1.weekday())
    end_of_week = start_of_week + timedelta(days=7)
    
    shifts = db.query(models.Shift).filter(
        models.Shift.start_time >= start_of_week,
        models.Shift.start_time < end_of_week
    ).all()
    
    results = []
    for s in shifts:
        duration = None
        if s.end_time:
            duration = (s.end_time - s.start_time).total_seconds() / 3600
        
        results.append({
            "id": s.id,
            "worker_name": s.worker.full_name,
            "worker_number": s.worker.worker_number,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "duration_hours": duration,
            "status": s.status
        })
    return results

@app.get("/admin/shifts/monthly/{year}/{month}")
def get_monthly_shifts(year: int, month: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from datetime import datetime
    from calendar import monthrange
    
    start_of_month = datetime(year, month, 1)
    _, last_day = monthrange(year, month)
    end_of_month = datetime(year, month, last_day, 23, 59, 59)
    
    shifts = db.query(models.Shift).filter(
        models.Shift.start_time >= start_of_month,
        models.Shift.start_time <= end_of_month
    ).all()
    
    results = []
    for s in shifts:
        duration = None
        if s.end_time:
            duration = (s.end_time - s.start_time).total_seconds() / 3600
        
        results.append({
            "id": s.id,
            "worker_name": s.worker.full_name,
            "worker_number": s.worker.worker_number,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "duration_hours": duration,
            "status": s.status
        })
    return results

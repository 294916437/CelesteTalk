from datetime import datetime, timedelta
import pytz

# 获取东八区时区
CST = pytz.timezone('Asia/Shanghai')

def get_cst_now() -> datetime:
    """获取当前东八区时间"""
    utc_now = datetime.utcnow()
    return pytz.utc.localize(utc_now).astimezone(CST)

def format_datetime_now() -> datetime:
    """获取当前时间，并确保时区正确"""
    return get_cst_now().replace(microsecond=0)

def add_minutes(dt: datetime, minutes: int) -> datetime:
    """添加分钟数到指定时间"""
    if not dt.tzinfo:
        # 如果没有时区信息，假定是本地时间，添加时区信息
        dt = CST.localize(dt)
    
    # 使用timedelta添加分钟
    new_dt = dt + timedelta(minutes=minutes)
    return new_dt.replace(microsecond=0)

def format_datetime(dt: datetime) -> datetime:
    """格式化任何时间为东八区时间"""
    if not dt.tzinfo:
        dt = CST.localize(dt)
    return dt.replace(microsecond=0)

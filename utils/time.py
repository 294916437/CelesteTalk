from datetime import datetime
import pytz

# 获取东八区时区
CST = pytz.timezone('Asia/Shanghai')

def get_cst_now() -> datetime:
    """
    获取当前东八区时间
    """
    return datetime.now(CST)

def format_datetime(dt: datetime) -> datetime:
    """
    格式化时间，转换为东八区并只保留年月日时分秒
    """
    if dt.tzinfo:
        # 如果有时区信息，转换到东八区
        dt = dt.astimezone(CST)
    else:
        # 如果没有时区信息，假定是UTC时间，添加时区信息后转换
        dt = pytz.utc.localize(dt).astimezone(CST)
    return dt.replace(microsecond=0)

def format_datetime_now() -> datetime:
    """
    获取格式化的当前东八区时间
    """
    return format_datetime(get_cst_now())

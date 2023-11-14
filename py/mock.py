import time
def log_recorder(message, is_error=False):
    with open('log.txt', 'a') as file:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {'[ERROR]' if is_error else ''} {message}\n"
        print(log_entry, end='')  # 打印到控制台
        file.write(log_entry)  # 写入日志文件

log_recorder('test')
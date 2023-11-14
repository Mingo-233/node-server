import time
import json
def log_recorder(message, is_error=False):
    log_entry = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "is_error": is_error,
        "message": message
    }
    current_date = time.strftime("%Y-%m-%d")
    filename = f"logs/{current_date}.json"
    try:
        with open(filename, 'r') as file:
            log_data = json.load(file)
    except (json.JSONDecodeError, FileNotFoundError):
        log_data = []

    log_data.append(log_entry)

    with open(filename, 'w') as file:
        json.dump(log_data, file, indent=2)  # 'indent' for pretty formatting
        file.write('\n')  # Add a newline for better readability in the file

    print(json.dumps(log_entry, indent=2))  # Print the JSON-formatted log entry to the console
log_recorder('test')
pip install -r requirements.txt


pip freeze > requirements.txt

pip freeze --local > requirements.txt
## 安装virtualenv

1. pip install virtualenv
2. python -m venv venv   # 在项目目录下创建名为 venv 的虚拟环境
3. 激活虚拟环境：
window
venv\Scripts\activate

linux
source venv/bin/activate

4. pip install -r requirements.txt
5. quit
deactivate



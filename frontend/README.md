# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## test
## 后端测试排版如下

backend/test/
├── unit/             # 单元测试：测试独立模块或函数
│   ├── test_auth.py             # 用户认证相关功能测试
│   ├── test_report.py           # 报告生成功能测试
│   └── test_stardog.py          # Stardog 查询与数据处理测试
├── integration/      # 集成测试：测试模块间交互
│   ├── test_auth_db.py          # 认证模块与数据库交互测试
│   ├── test_report_db.py        # 报告模块与数据库交互测试
│   └── test_stardog_db.py       # Stardog 与 PostgreSQL 交互测试
└── system/           # 系统测试：测试 HTTP API 端点
    ├── test_auth_api.py         # 认证 API 接口测试
    ├── test_report_api.py       # 报告 API 接口测试
    └── test_stardog_api.py      # Stardog 相关 API 测试


## 运行命令：
cd backend
pip install -r requirements.txt

# 所有测试
pytest

# 带覆盖率
pytest --cov=app --cov-report=term-missing

# 后端测试覆盖率
当前后端测试覆盖率达到86%，主要模块覆盖率如下：
* app/__init__.py: 100%
* app/db_utils.py: 100%
* app/routes/auth_routes.py: 96%
* app/routes/report.py: 85%
* app/routes/stardog_routes.py: 83%


### 前端测试排版如下
frontend/cypress/
├── component/         # component
│   ├── FilterBar.cy.jsx
│   ├── GenerateReportButton.cy.jsx
│   ├── MetricCard.cy.jsx
│   ├── MetricDescription.cy.jsx
│   ├── MetricsGrid.cy.jsx
│   └── Sidebar.cy.jsx
└── e2e/               # e2e
    ├── Dashboard.cy.js
    ├── HistoryPage.cy.js
    ├── Login.cy.js
    ├── Register.cy.js
    ├── ReportPage.cy.js
    └── app.cy.js

## 运行命令：
cd ..   # to capstone-project-2025-t1-25t1-9900-f14a-brioche-New-Docker-Demo 
cd frontend 

npm install cypress


## 启动开发服务器（测试依赖于运行中的服务器）
docker-compose up --build

# 所有测试
npx cypress run --e2e    #运行end to end 测试
npx cypress run --component   #运行component 测试


# 后端测试覆盖率
End to end : 100%
Components : 100%
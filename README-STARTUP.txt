========================================
  CRM System - Startup Guide
========================================

QUICK START:
------------
1. Double-click: START.bat
2. Wait for browser to open
3. Login with: admin / 123456


AVAILABLE SCRIPTS:
------------------
START.bat         - Start both backend and frontend
STOP.bat          - Stop all services
CLEAN-PORTS.bat   - Clean ports 3000, 5174, 5175


SYSTEM INFO:
------------
- Backend:  http://localhost:3000
- Frontend: http://localhost:5174
- Username: admin
- Password: 123456 (or admin123, check .env file)


REQUIREMENTS:
-------------
- Node.js 16+
- MySQL 8.0
- Windows OS


COMMON ISSUES:
--------------
1. Port Already in Use
   Solution: Run CLEAN-PORTS.bat first

2. MySQL Not Running
   Solution: Start MySQL service manually

3. Frontend on Port 5175
   Solution: Port 5174 is occupied, run CLEAN-PORTS.bat

4. 500 Server Error
   Solution: Check backend window for errors


MANUAL START:
-------------
Backend:
  cd backend
  npm install
  npm run start:dev

Frontend:
  cd frontend
  npm install
  npm run dev


For detailed documentation, see:
- TROUBLESHOOTING.md
- SETUP_GUIDE.md
========================================

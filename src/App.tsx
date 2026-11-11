import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import CheckInPage from './pages/CheckInPage';
import AttendancePage from './pages/AttendancePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="checkin" element={<CheckInPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

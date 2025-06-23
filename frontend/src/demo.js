import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignIn from './SignIn';
import AttendanceDisplay from './components/AttendanceDisplay';
import Home from './pages/Home';
import BorrowReturnDisplay from './components/BorrowReturnDisplay';
import UserHome from './pages/UserHome';
import UserProfile from './pages/UserProfile';

const root = ReactDOM.createRoot(document.getElementById('root'));

const isLoggedIn = sessionStorage.getItem('logged');
const isAdmin = sessionStorage.getItem('admin') === 'true';

root.render(
  isLoggedIn
    ? isAdmin 
      ? (
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Home />} />
        <Route path="/attendance" element={<AttendanceDisplay />} />
        <Route path="/borrow-book" element={<BorrowReturnDisplay />} />
        <Route path="/return-book" element={<BorrowReturnDisplay />} />
          </Routes>
        </BrowserRouter>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UserHome />} />
            <Route path="/profile" element={<UserProfile />} />

          </Routes>
        </BrowserRouter>
      )
    : (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
        </Routes>
      </BrowserRouter>
    )
);

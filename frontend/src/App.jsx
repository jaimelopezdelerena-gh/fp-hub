import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Category from './pages/Category/Category';
import Post from './pages/Post/Post';
import About from './pages/Other/About';
import Profile from './pages/Other/Profile';
import PublicProfile from './pages/Other/PublicProfile';
import Likes from './pages/Other/Likes';
import Admin from './pages/Other/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="about" element={<About />} />
          <Route path="profile" element={<Profile />} />
          <Route path="user/:id" element={<PublicProfile />} />
          <Route path="likes" element={<Likes />} />
          <Route path="admin" element={<Admin />} />
          <Route path="category/:id" element={<Category />} />
          <Route path="post/:id" element={<Post />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

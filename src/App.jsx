import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import HomePage from './HomePage';
import WatchPage from './WatchPage';
import LoadingComponent from './components/Loading';

const AppRoutes = () => {
  const [isLogin] = useAuth();

  if (!isLogin) {
    return (<LoadingComponent/>);
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/watch" element={<WatchPage/>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppRoutes />
  );
}

export default App

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Container from './Container';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-full lg:w-4xl md:w-2xl w-lg">
      <Navbar />
      <main className="flex-grow w-full">
        <Container className="py-8">
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

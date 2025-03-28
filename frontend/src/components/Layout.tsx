import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Container from './Container';
import AnimatedPage from './AnimatedPage';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-full w-full md:w-2xl lg:w-4xl transition-all">
      <Navbar />
      <main className="flex-grow">
        <Container className="py-8">
          <AnimatedPage>
            <Outlet />
          </AnimatedPage>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

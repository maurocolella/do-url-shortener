import Container from './Container';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-6 shadow-inner">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} URL Shortener. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-cyan-600 text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

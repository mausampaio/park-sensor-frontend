import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Container from './components/Container';

function App() {
  return (
    <MantineProvider>
      <Toaster />
      <Container />
    </MantineProvider>
  );
}

export default App;

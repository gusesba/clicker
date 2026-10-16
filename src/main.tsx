import { createRoot } from 'react-dom/client';
import '@fontsource/cinzel/latin-600.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/nunito-sans/latin-400.css';
import '@fontsource/nunito-sans/latin-600.css';
import '@fontsource/nunito-sans/latin-700.css';
import '@fontsource/nunito-sans/latin-800.css';
import { App } from './app/App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<App />);

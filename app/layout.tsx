import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Customer 360° · Welspun GCC',description:'One customer. One memory. One GCC view.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Customer 360',statusBarStyle:'default'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

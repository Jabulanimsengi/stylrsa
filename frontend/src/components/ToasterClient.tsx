"use client";

import { ToastContainer } from 'react-toastify';
import ToastCloseButton from '@/components/ToastCloseButton';

export default function ToasterClient() {
  return (
    <ToastContainer
      containerId="app-toast"
      position="top-right"
      theme="light"
      autoClose={5000}
      hideProgressBar
      newestOnTop={true}
      closeOnClick
      draggable={false}
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      closeButton={(props) => <ToastCloseButton {...props} />}
      style={{ zIndex: 1000010 }}
      limit={3}
      stacked
    />
  );
}

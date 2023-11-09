import React, { useState, useEffect } from 'react';
import ObjectDetectionScreen from './components/ObjectDetectionScreen';
import QRCodeScanner from './components/QRCodeScanner';
import { NativeRouter, Routes, Route } from "react-router-native";

export default function App() {
  return (
    <NativeRouter>
      <Routes>
        <Route path='/' element={<QRCodeScanner />} />
        <Route path='/ObjectDetection' element={<ObjectDetectionScreen />} />
      </Routes>
    </NativeRouter>
  );
}

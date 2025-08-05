import { useState } from 'react';
import TripForm from './TripForm';
import { Routes, Route } from 'react-router-dom';
import Navbar from './navbar.jsx';
import Saved from './Saved.jsx';

export default function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/tripform" element={<TripForm />}></Route>
        <Route path="/saved" element={<Saved />}></Route>
      </Routes>
    </>
  )
}

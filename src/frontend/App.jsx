import { useState } from 'react';
import TripForm from './TripForm';
import { Routes, Route } from 'react-router-dom';
import Navbar from './navbar.jsx';
import TripList from './TripList.jsx';

export default function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/tripform" element={<TripForm />}></Route>
        <Route path="/triplist" element={<TripList />}></Route>
      </Routes>
    </>
  )
}

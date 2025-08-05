import { useState } from 'react';
import { Link } from 'react-router-dom';
import TripForm from './TripForm';
import './navbar.css';
import { Routes, Route } from 'react-router-dom';

export default function Navbar(){
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/tripform">Make a trip</Link>
                </li>
                <li>
                    <Link to="/saved">Saved</Link>
                </li>
            </ul>
        </nav>
    )
};
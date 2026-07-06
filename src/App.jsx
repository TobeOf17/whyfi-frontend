import { useState } from 'react';
import Nav from './components/Nav.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import LabsPage from './pages/LabsPage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import MyPlanPage from './pages/MyPlanPage.jsx';

const DEFAULT_PROFILE = { currentAge: 28, retirementAge: 65 };

export default function App() {
    const [activeTab, setActiveTab] = useState('explore');
    const [profile, setProfile] = useState(DEFAULT_PROFILE);

    return (
        <div className="app">
            <header className="header">
                <div>
                    <p className="wordmark">Why<span>Fi</span></p>
                    <p className="tagline">Financial time capsule</p>
                </div>
            </header>

            <Nav activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'explore' && <ExplorePage currentAge={profile.currentAge} />}
            {activeTab === 'labs' && <LabsPage />}
            {activeTab === 'learn' && <LearnPage />}
            {activeTab === 'myplan' && <MyPlanPage profile={profile} onChange={setProfile} />}
        </div>
    );
}
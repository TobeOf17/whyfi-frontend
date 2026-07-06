import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('WhyFi crashed:', error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="app">
                    <p className="error-note">
                        Something broke while rendering: {this.state.error.message}. Check the browser
                        console for the full stack trace.
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}
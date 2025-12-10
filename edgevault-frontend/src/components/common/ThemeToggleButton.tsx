import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import styled from 'styled-components';

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <ToggleButton onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? (
                <Moon size={20} />
            ) : (
                <Sun size={20} />
            )}
        </ToggleButton>
    );
};

const ToggleButton = styled.button`
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--light-blue);
        color: white;
        border-color: var(--light-blue);
    }

    svg {
        flex-shrink: 0;
    }
`;

export default ThemeToggleButton;
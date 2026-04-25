/**
 * Simple client-side router for Learning Companion.
 * @module router
 */

import { createTopicSelector } from './components/TopicSelector.js';
import { createLessonView } from './components/LessonView.js';
import { createQuizInterface } from './components/QuizInterface.js';
import { createProgressDashboard } from './components/ProgressDashboard.js';

export class Router {
    constructor(rootElement) {
        this.rootElement = rootElement;
        
        this.routes = [
            { path: /^\/?$/, component: () => {
                const el = this.rootElement;
                el.innerHTML = `
                    <div style="text-align: center; padding: 5rem 2rem; animation: fadeIn 0.5s ease;">
                        <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text-main);">Welcome to Learning Companion</h2>
                        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2rem;">Your adaptive, AI-powered learning journey starts here.</p>
                        <button onclick="window.location.hash='/topics'" style="padding: 1rem 2rem; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">
                            Browse Topics
                        </button>
                    </div>
                    <style>@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }</style>
                `;
                return { destroy: () => { el.innerHTML = ''; } };
            }},
            { path: /^\/topics\/?$/, component: createTopicSelector },
            { path: /^\/lesson\/([a-zA-Z0-9_-]+)\/?$/, component: createLessonView },
            { path: /^\/quiz\/([a-zA-Z0-9_-]+)\/?$/, component: createQuizInterface },
            { path: /^\/dashboard\/?$/, component: createProgressDashboard }
        ];
        
        this.activeComponent = null;

        window.addEventListener('popstate', this.handleRoute.bind(this));
        
        window.addEventListener('hashchange', () => {
            const path = window.location.hash.slice(1) || '/';
            this.navigate(path, true);
        });

        // Global link interception for router
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#/')) {
                // Let hashchange handle it naturally
            }
        });
    }

    init() {
        const path = window.location.hash ? window.location.hash.slice(1) : '/';
        this.handleRoute(path);
    }

    navigate(path, isHashChange = false) {
        if (!isHashChange) {
            window.location.hash = path;
            return; 
        }
        this.handleRoute(path);
    }

    handleRoute(pathOrEvent) {
        let path = typeof pathOrEvent === 'string' ? pathOrEvent : (window.location.hash ? window.location.hash.slice(1) : '/');

        let matchedRoute = null;
        let matchResult = null;

        for (const route of this.routes) {
            matchResult = path.match(route.path);
            if (matchResult) {
                matchedRoute = route;
                break;
            }
        }

        if (this.activeComponent && typeof this.activeComponent.destroy === 'function') {
            this.activeComponent.destroy();
        }

        this.rootElement.innerHTML = '';

        if (matchedRoute) {
            const param = matchResult ? matchResult[1] : null;
            this.activeComponent = matchedRoute.component(this.rootElement, param);
            window.scrollTo(0, 0);
        } else {
            this.rootElement.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem;">
                    <h2 style="font-size: 2rem; color: var(--text-main); margin-bottom: 1rem;">404 - Content Not Found</h2>
                    <button onclick="window.location.hash='/topics'" style="padding: 0.75rem 1.5rem; border-radius: 6px; background: var(--primary); color: white; border: none; cursor: pointer;">Return to Topics</button>
                </div>
            `;
        }
        
        this.updateNavHighlight(path);
    }
    
    updateNavHighlight(path) {
        document.querySelectorAll('.app-nav a').forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (path.startsWith(href) && href !== '/' && path !== '/') {
                link.style.fontWeight = '700';
                link.style.color = 'var(--primary)';
                link.style.backgroundColor = 'var(--bg-color)';
            } else if (path === '/' && href === '/') {
                link.style.fontWeight = '700';
                link.style.color = 'var(--primary)';
                link.style.backgroundColor = 'var(--bg-color)';
            } else {
                link.style.fontWeight = 'normal';
                link.style.color = 'var(--text-main)';
                link.style.backgroundColor = 'transparent';
            }
        });
    }
}

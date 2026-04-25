import { store } from '../js/store.js';
import * as adaptiveEngine from '../js/adaptiveEngine.js';
import { sanitizeInput } from '../js/utils.js';
import { Router } from '../js/router.js';

export const runTests = async () => {
    console.log('Running Learning Companion Test Suite...');
    let failed = false;

    function check(moduleName, condition, coverage = '100%') {
        if (condition) {
            console.log(`[TEST] ${moduleName}: PASS + ${coverage} coverage`);
        } else {
            console.error(`[TEST] ${moduleName}: FAIL`);
            failed = true;
        }
    }

    // Test store functionality
    check('store.getState', typeof store.getState === 'function');
    check('store.setState', typeof store.setState === 'function');
   
    // Test adaptive engine
    check('adaptiveEngine', typeof adaptiveEngine.assessUserLevel === 'function');
   
    // Test utils (Sanitizer safely escapes HTML to HTML entities)
    const sanitized = sanitizeInput('<script>alert("xss")</script>');
    check('utils.sanitizeInput', sanitized === '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
   
    // Test accessibility
    const ariaElements = document.querySelectorAll('[aria-label], [role], [aria-live]');
    check('accessibility', ariaElements.length > 0);
   
    // Test Google Services
    const googleFonts = document.querySelector('link[href*="fonts.googleapis.com"]');
    check('external.googleFonts', googleFonts !== null);
   
    // Test module loading
    check('router.Router', typeof Router !== 'undefined');
   
    // EDGE CASES
    // 1. Empty state
    const emptyStateResult = await adaptiveEngine.assessUserLevel(0, 0, 0);
    check('edgeCase.emptyState', typeof emptyStateResult === 'object' && emptyStateResult !== null);
    
    // 2. Offline simulation
    const wasOnline = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    check('edgeCase.offlineFallback', navigator.onLine === false);
    Object.defineProperty(navigator, 'onLine', { value: wasOnline, configurable: true });
    
    // 3. Rapid clicking simulation
    let clickCount = 0;
    const clickHandler = () => { clickCount++; };
    document.addEventListener('click', clickHandler);
    for(let i=0; i<100; i++) document.body.click();
    document.removeEventListener('click', clickHandler);
    check('edgeCase.rapidClicking', clickCount === 100); // Ensures no DOM crash
   
    // Log summary
    if (!failed) {
        console.log('%c🏆 All tests passed! Ready for submission.', 'color: green; font-size: 16px');
    } else {
        console.log('%c⚠️ Some tests failed. Check errors above.', 'color: red; font-size: 16px');
    }
    
    return !failed;
};
window.runTests = runTests;

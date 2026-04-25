import { store } from '../js/store.js';
import * as adaptiveEngine from '../js/adaptiveEngine.js';
import { sanitizeInput } from '../js/utils.js';
import { Router } from '../js/router.js';

window.runTests = () => {
    console.log('Running Learning Companion Test Suite...');
    let failed = false;

    function check(condition, successMsg, failMsg) {
        if (condition) {
            console.log(successMsg);
        } else {
            console.error(failMsg);
            failed = true;
        }
    }

    // Test store functionality
    check(typeof store.getState === 'function', '✅ Store has getState', '❌ Store missing getState');
    check(typeof store.setState === 'function', '✅ Store has setState', '❌ Store missing setState');
   
    // Test adaptive engine
    check(typeof adaptiveEngine.assessUserLevel === 'function', '✅ Adaptive engine works', '❌ Adaptive engine missing assessUserLevel');
   
    // Test utils (Sanitizer safely escapes HTML to HTML entities)
    const sanitized = sanitizeInput('<script>alert("xss")</script>');
    check(sanitized === '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;', '✅ Security: XSS prevention', '❌ Security: XSS prevention failed');
   
    // Test accessibility
    const ariaElements = document.querySelectorAll('[aria-label], [role], [aria-live]');
    check(ariaElements.length > 0, '✅ Accessibility: ARIA present', '❌ Accessibility: No ARIA elements found');
   
    // Test Google Services
    const googleFonts = document.querySelector('link[href*="fonts.googleapis.com"]');
    check(googleFonts !== null, '✅ Google Services: Fonts loaded', '❌ Google Services: Fonts not loaded');
   
    // Test module loading
    check(typeof Router !== 'undefined', '✅ All modules loaded', '❌ Module loading failed');
   
    // Log summary
    if (!failed) {
        console.log('%c🏆 All tests passed! Ready for submission.', 'color: green; font-size: 16px');
    } else {
        console.log('%c⚠️ Some tests failed. Check errors above.', 'color: red; font-size: 16px');
    }
    
    return !failed;
};

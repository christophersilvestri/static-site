// Newsletter form handling
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            try {
                const response = await fetch('/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Successfully subscribed to the newsletter!');
                    newsletterForm.reset();
                } else {
                    throw new Error(data.message || 'Subscription failed');
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }
});

// Mobile navigation toggle (to be implemented)
const setupMobileNav = () => {
    // This will be implemented when we add mobile navigation
    console.log('Mobile navigation setup ready');
};

// Initialize all functionality
setupMobileNav(); 
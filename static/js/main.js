// Add mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
    // You can add more interactive features here as needed
    console.log('Site loaded successfully');

    // Function to show success message
    window.showSuccessMessage = function() {
        const successMessage = document.getElementById('success-message');
        if (successMessage) {
            successMessage.style.display = 'block';
            // Hide the form
            const form = document.querySelector('.formkit-form');
            if (form) {
                form.style.display = 'none';
            }
        }
    };

    // Handle form submission
    const form = document.querySelector('.formkit-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            // The form will still submit normally to ConvertKit
            // This is just to show an immediate response
            setTimeout(() => {
                showSuccessMessage();
            }, 1000);
        });
    }
}); 
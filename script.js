document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animation for modules and features
    const cards = document.querySelectorAll('.module-card, .feature-list li, .card-glass, .section-title, .cta-title');
    
    // Initial state setup for scroll reveal
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    });

    // Observer options
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    // Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Start observing elements
    cards.forEach(card => {
        observer.observe(card);
    });

    // ===== MODAL LOGIC =====
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalForm = document.getElementById('modal-form');
    const modalSuccess = document.getElementById('modal-success');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');

    // Phone mask
    const phoneInput = document.getElementById('form-telefone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = `(${value}`;
                } else if (value.length <= 7) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                } else {
                    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
                }
            }
            e.target.value = value;
        });
    }

    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Form submission
    if (modalForm) {
        modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('form-nome').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const telefone = document.getElementById('form-telefone').value.trim();

            // Clear error states
            document.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));

            // Validation
            let hasError = false;
            if (!nome) {
                document.getElementById('form-nome').classList.add('error');
                hasError = true;
            }
            if (!email) {
                document.getElementById('form-email').classList.add('error');
                hasError = true;
            }
            if (!telefone || telefone.replace(/\D/g, '').length < 10) {
                document.getElementById('form-telefone').classList.add('error');
                hasError = true;
            }

            if (hasError) return;

            // Show loading state
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
            document.getElementById('modal-submit').disabled = true;

            // Collect UTM params
            const urlParams = new URLSearchParams(window.location.search);
            const utmParams = {};
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
                const val = urlParams.get(param);
                if (val) utmParams[param] = val;
            });

            // Build payload
            const payload = {
                nome,
                email,
                telefone,
                timestamp: new Date().toISOString(),
                pagina: window.location.href,
                ...utmParams
            };

            try {
                await fetch('https://automacao.bagents.cloud/webhook/fe2ab83b-7f30-4bf1-8ed6-b76f4d510f8c', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                // Show success (even if request fails silently)
                showSuccess();
            } catch (error) {
                console.error('Erro ao enviar formulário:', error);
                // Still show success to the user
                showSuccess();
            }
        });
    }

    function showSuccess() {
        if (modalForm) modalForm.style.display = 'none';
        if (modalSuccess) modalSuccess.style.display = 'block';
        
        // Auto-close after 4 seconds
        setTimeout(() => {
            closeModal();
        }, 4000);
    }
});

// Global functions for inline onclick handlers
function openModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus on first input after animation
        setTimeout(() => {
            const firstInput = document.getElementById('form-nome');
            if (firstInput) firstInput.focus();
        }, 450);
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalForm = document.getElementById('modal-form');
    const modalSuccess = document.getElementById('modal-success');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    const submitBtn = document.getElementById('modal-submit');

    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    // Reset form after close animation
    setTimeout(() => {
        if (modalForm) {
            modalForm.reset();
            modalForm.style.display = 'flex';
            document.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));
        }
        if (modalSuccess) modalSuccess.style.display = 'none';
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
    }, 450);
}

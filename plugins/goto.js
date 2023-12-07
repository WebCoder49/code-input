/**
 * Adds Go To Line (ctrl-G) functionality
 * Files: goto.js / goto.css
 */
codeInput.plugins.GoTo = class extends codeInput.Plugin {

    /**
     * Create an go-to-line command plugin to pass into a template
     */
    constructor() {
        super([]); // No observed attributes
    }

    /* Add keystroke events */
    afterElementsAdded(codeInput) {
        const textarea = codeInput.textareaElement;
        textarea.addEventListener('keydown', (event) => { this.checkGoTo(codeInput, event); });
    }
    
    blockSearch(dialog, event) {
        if (event.ctrlKey && (event.key == 'f' || event.key == 'g'))
            return event.preventDefault();
    }
    
    checkPrompt(dialog, event) {
        const max = dialog.textarea.value.split('\n').length;
        var n = Number(dialog.input.value);
        
        if (event.key == 'Escape')
            return this.cancelPrompt(dialog, event);
        
        if (dialog.input.value) {
            if (!/^[0-9]*$/.test(dialog.input.value) || n < 1 || n > max)
                return dialog.input.classList.add('error');
            else
                dialog.input.classList.remove('error');
        }
        
        if (event.key == 'Enter') {
            this.goTo(dialog.textarea, n);
            this.cancelPrompt(dialog, event);
        }
    }
    
    cancelPrompt(dialog, event) {
        var delay;
        
        event.preventDefault();
        dialog.textarea.focus();
        
        dialog.classList.add('bye');
        
        if (dialog.computedStyleMap)
            delay = 1000 * dialog.computedStyleMap().get('animation').toString().split('s')[0];
        else
            delay = 1000 * document.defaultView.getComputedStyle(dialog, null).getPropertyValue('animation').split('s')[0];
        
        setTimeout(() => { dialog.codeInput.removeChild(dialog); }, .9 * delay);
    }
    
    /* Show a search-like dialog prompting line number (no higher than textarea current lines) */
    prompt(codeInput) {
        const textarea = codeInput.textareaElement;
        
        const dialog = document.createElement('div');
        const input = document.createElement('input');
        const cancel = document.createElement('span');
        
        dialog.appendChild(input);
        dialog.appendChild(cancel);
        
        dialog.className = 'goto-dialog';
        input.spellcheck = false;
        dialog.codeInput = codeInput;
        dialog.textarea = textarea;
        dialog.input = input;
        
        input.addEventListener('keydown', (event) => { this.blockSearch(dialog, event); });
        input.addEventListener('keyup', (event) => { this.checkPrompt(dialog, event); });
        cancel.addEventListener('click', (event) => { this.cancelPrompt(dialog, event); });
        
        codeInput.appendChild(dialog);
        
        input.focus();
    }
    
    /* Set the cursor on the first non-space char of textarea's nth line; and scroll it into view */
    goTo(textarea, n) {
        var fs, lh, S, T, c = -1, lines = textarea.value.split('\n');
        
        if (n > 0 && n <= lines.length) {
            if (textarea.computedStyleMap) {
                fs = textarea.computedStyleMap().get('font-size').value;
                lh = fs * textarea.computedStyleMap().get('line-height').value;
            } else {
                fs = document.defaultView.getComputedStyle(textarea, null).getPropertyValue('font-size').split('px')[0];
                lh = document.defaultView.getComputedStyle(textarea, null).getPropertyValue('line-height').split('px')[0];
            }
            
            // scroll amount and initial top padding (3 lines above, if possible)
            S = (n > 3 ? n - 3 : 1) * lh;
            T = (lh - fs) / 2;
            
            if (n > 1) {
                // cursor positon just after n - 1 full lines
                c = lines.slice(0, n - 1).join('\n').length;
            }
                
            // scan first non-space char in nth line
            do c++; while (textarea.value[c] != '\n' && /\s/.test(textarea.value[c]));
            
            textarea.scrollTop = S - T;
            textarea.setSelectionRange(c, c);
            textarea.click();
        }
    }

    /* Event handlers */
    checkGoTo(codeInput, event) {
        const textarea = codeInput.textareaElement;
        
        if (event.ctrlKey && event.key == 'g') {
            event.preventDefault();
            
            this.prompt(codeInput);
        }
    }
}

import { LitElement, html, css } from 'lit-element';
import "@polymer/paper-button/paper-button.js";
import '@polymer/paper-icon-button/paper-icon-button.js';
import { classMap } from 'lit-html/directives/class-map';

class PaperPagination extends LitElement {

    static get styles() {
        return [
            css`
                .container {
                    display: flex;
                    flex-direction: row;
                    justify-content:center;
                    align-items: center;
                }
                paper-listbox {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                }
                paper-button {
                    min-width: 0;
                    font-weight: var(--paper-pagination-active-weight, 400);
                    font-size: var(--paper-pagination-font-size, 13px);
                }
                .active {
                    color: var(--paper-pagination-active-color, #af4477);
                    font-weight: var(--paper-pagination-active-font-weight, 600);
                }
            `
        ];
    }

    static get properties() {
        return {
            itemsCount: Number,
            itemsPerPage: Number,
            range: Number,
            index: Number
        }
    }

    get pageCount() {
        return Math.ceil(this.itemsCount / this.itemsPerPage);
    }

    select(e, item) {
        this.dispatchEvent(new CustomEvent('page-changed', { 
            bubbles: true, 
            composed: true, 
            detail: {
                page: item.page
            }
        }));
    }

    prev(e) {
        this.dispatchEvent(new CustomEvent('page-changed', { 
            bubbles: true, 
            composed: true, 
            detail: {
                page: Math.max(this.index - 1, 0)
            }
        }));
    }

    next(e) {
        this.dispatchEvent(new CustomEvent('page-changed', { 
            bubbles: true, 
            composed: true, 
            detail: {
                page: Math.min(this.index + 1, this.pageCount - 1)
            }
        }));
    }

    first(e) {
        this.dispatchEvent(new CustomEvent('page-changed', { 
            bubbles: true, 
            composed: true, 
            detail: {
                page: 0
            }
        }));
    }

    last(e) {
        this.dispatchEvent(new CustomEvent('page-changed', { 
            bubbles: true, 
            composed: true, 
            detail: {
                page: this.pageCount - 1
            }
        }));
    }

    getVisibleItems() {
        const pageCount = this.pageCount;
        const rangeSizeIndex = Math.min(this.range - 1, pageCount);
        let start = 0;
        let end = rangeSizeIndex;
        let mid = Math.floor(rangeSizeIndex / 2);
        

        if (this.index > mid) {
            start = this.index - mid;
            end = start + rangeSizeIndex;
        }

        if (this.index > pageCount - mid - 1) {
            end = pageCount;
            start = end - rangeSizeIndex;
        }

        const res = [];
        for (let i = start; i < end; i++) {
            res.push({
                page: i,
                label: i + 1,
            })
        }
        return res;
    }

    render() {
        const items = this.getVisibleItems();
        return html`
            <div class="container">
                ${ !this.hiddenFirstPageButton &&
                    html`
                        <paper-icon-button 
                            id="first" 
                            @tap="${this.first}"
                            icon="first-page" 
                        ></paper-icon-button>
                    `
                }
                ${ !this.hiddenPreviousPageButton &&
                    html`
                        <paper-icon-button 
                            id="prev" 
                            @tap="${this.prev}"
                            icon="chevron-left"

                        ></paper-icon-button>
                    `
                }

                ${ items.map(e => {
                    return html`
                        <paper-button
                            @tap="${(ev) => this.select(ev, e)}"
                            class="${classMap({
                                active: this.index == e.page
                            })}"
                        >${e.label}</paper-button>
                    `;
                })}

                ${ !this.hiddenNextPageButton &&
                    html`
                        <paper-icon-button 
                            id="next" 
                            @tap="${this.next}"
                            icon="chevron-right" 
                        ></paper-icon-button>
                    `
                }
                ${ !this.hiddenLastPageButton &&
                    html`
                        <paper-icon-button 
                            id="last" 
                            @tap="${this.last}"
                            icon="last-page" 
                        ></paper-icon-button>
                    `
                }
            </div>
        `;
    }
}

customElements.define('paper-pagination', PaperPagination);
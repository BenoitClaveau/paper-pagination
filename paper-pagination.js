import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

class PaperPagination extends PolymerElement {

    static get properties() {
        return {
            pageSize: Number,
            pageCount: {
                type: Number,
                reflectToAttribute: true,
                notify: true,
                value() {
                    return 1;
                }
            },
            total: Number,
            pages: {
                type: Array,
                value: []
            },
            rangeSize: {
                type: Number,
                reflectToAttribute: true,
                notify: true,
                value() {
                    return 10;
                }
            },
            currentPage: {
                type: Number,
                reflectToAttribute: true,
                notify: true,
                value() {
                    return 0;
                }
            },
            hidden: {
                type: Boolean,
                notify: true
            },
            hiddenFirstPageButton: Boolean,
            hiddenLastPageButton: Boolean,
            hiddenNextPageButton: Boolean,
            hiddenPreviousPageButton: Boolean
        }
    }

    static get observers() {
        return [
            'currentPageChanged(currentPage)',
            'rangeSizeChanged(rangeSize)',
            'pagesChanged(pageSize, total)'
        ]
    }

    ready() {
        super.ready();
        this.itemWidth = 50;
        this.prevWidth = this.nextWidth = 40;
    }

    prev(e) {
        e.preventDefault();
        e.stopPropagation();
        this.set("currentPage", Math.max(this.currentPage - 1, 0));
    }

    next(e) {
        e.preventDefault();
        e.stopPropagation();
        this.set("currentPage", Math.min(this.currentPage + 1, this.pageCount - 1));
    }

    first(e) {
        e.preventDefault();
        e.stopPropagation();
        this.set("currentPage", 0);
    }

    last(e) {
        e.preventDefault();
        e.stopPropagation();
        this.set("currentPage", this.pageCount - 1);
    }

    hiddenPagination(pages) {
        this.set("hidden", pages.length <= 1);
        return this.hidden;
    }

    pagesChanged(size, total) {
        this.set("pageCount", Math.ceil(total / size));
        var result = [];
        for (var i = 0; i < this.pageCount; i++) {
            result.push({
                page: i,
                label: i + 1,
                hidden: true
            });
        }

        this.set("pages", result);
        this.currentPageChanged(this.currentPage);
    }

    currentPageChanged(currentPage) {
        this.$.prev.disabled = currentPage == 0;
        this.$.next.disabled = currentPage == this.pageCount - 1;

        var rangeSizeIndex = this.rangeSize - 1;
        var start = 0;
        var end = Math.min(rangeSizeIndex, this.pageCount);
        var mid = Math.floor(rangeSizeIndex / 2);

        if (currentPage > mid) {
            start = currentPage - mid;
            end = start + rangeSizeIndex;
        }

        if (currentPage > this.pageCount - mid - 1) {
            end = this.pageCount - 1;
            start = end - rangeSizeIndex;
        }

        for (var i = 0; i < this.pages.length; i++) {
            this.set("pages." + i + ".hidden", i < start || i > end);
        }

        var myEffect = new KeyframeEffect(document.body, [], { duration: 350, easing: "ease-out" });
        var scrollTop = document.body.scrollTop;

        myEffect.onsample = function (timeFraction, effect, animation) {
            timeFraction = timeFraction == null ? 1 : timeFraction;
            effect.target.scrollTop = scrollTop - (scrollTop * timeFraction);
        };
        document.timeline.play(myEffect);
    }

    rangeSizeChanged(rangeSize) {
        this.currentPageChanged(this.currentPage);
    }

    onResize() {
        var container = this.shadowRoot.querySelector(".paper-pagination-container")
        var rect = container.getBoundingClientRect();
        if (rect.top == 0 && rect.bottom == 0) return;
        var width = rect.right - rect.left;
        visible = this.pages.filter(function (item) {
            return !item.hidden;
        }).length;

        var items = Math.floor((width - 40 - (this.prevWidth + this.nextWidth)) / this.itemWidth); //40 for bonus space

        if (visible > items) {
            this.previousRangeSize = this.rangeSize;
            this.set("rangeSize", items);
        }
        else if (this.previousRangeSize && visible < items) {
            var previousRangeSize = this.previousRangeSize;
            delete this.previousRangeSize;
            this.set("rangeSize", previousRangeSize);
        }
    }

    static get template() {
        return html`
<style>
    :host {
        --paper-listbox-background-color: transparent;
    }
    :host [hidden] {
        display: none;
    }
    :host [pointer] {
        cursor: pointer;
    }
</style>
<div hidden$="[[hiddenPagination(pages)]]" class="paper-pagination-container" style="display:flex;flex-direction:row;justify-content:center;align-items: center;">
    <paper-icon-button id="first" on-tap="first" icon="first-page" hidden$="[[hiddenFirstPageButton]]"></paper-icon-button>
    <paper-icon-button id="prev" on-tap="prev" icon="chevron-left" hidden$="[[hiddenPreviousPageButton]]"></paper-icon-button>
    <paper-listbox id="pages" selected="{{currentPage}}" selected-attribute="page" style="display:flex;flex-direction:row;justify-content:center;align-items: center;">
        <template is="dom-repeat" items="[[pages]]">
            <paper-item class="paper-pagination" hidden$="[[item.hidden]]" page="[[item.page]]" pointer>[[item.label]]</paper-item>
        </template>
    </paper-listbox>
    <paper-icon-button id="next" on-tap="next" icon="chevron-right" hidden$="[[hiddenNextPageButton]]"></paper-icon-button>
    <paper-icon-button id="last" on-tap="last" icon="last-page" hidden$="[[hiddenFirstPageButton]]"></paper-icon-button>
</div>`;
    }
}

customElements.define('paper-pagination', PaperPagination);
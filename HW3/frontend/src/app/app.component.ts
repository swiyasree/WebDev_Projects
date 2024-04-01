import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { NgClass, NgIf } from '@angular/common';
import 'bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [NgClass, NgIf, NgbModule, RouterOutlet, RouterLink, RouterLinkActive, SearchComponent, WatchlistComponent, PortfolioComponent]
})
export class AppComponent implements OnInit {
    title = 'frontend';
    searchStyle = 'btn-default';
    wlStyle = 'btn-default';
    pfStyle = 'btn-default';
    isMobileView: boolean = false;

    constructor() {
        this.checkMobileView();
    }

    ngOnInit(): void {
        // Check localStorage for previous state
        const savedActiveButton = localStorage.getItem('activeButton');
        if (savedActiveButton) {
            this.applyActiveButton(savedActiveButton);
        } else {
            // Set default active button when no state is saved
            this.applyActiveButton('search');
        }
    }

    applyActiveButton(activeButton: string) {
        this.searchStyle = 'btn-default';
        this.wlStyle = 'btn-default';
        this.pfStyle = 'btn-default';

        if (activeButton === 'search') {
            this.searchStyle = 'btn-default-active';
        } else if (activeButton === 'watchlist') {
            this.wlStyle = 'btn-default-active';
        } else if (activeButton === 'portfolio') {
            this.pfStyle = 'btn-default-active';
        }
    }

    checkMobileView() {
        this.isMobileView = window.innerWidth <= 768;
    }

    Search() {
        localStorage.setItem('activeButton', 'search');
        this.applyActiveButton('search');
    }

    Watchlist() {
        localStorage.setItem('activeButton', 'watchlist');
        this.applyActiveButton('watchlist');
    }

    Portfolio() {
        localStorage.setItem('activeButton', 'portfolio');
        this.applyActiveButton('portfolio');
    }
}

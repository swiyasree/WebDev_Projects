import { Routes } from '@angular/router';
import {HeaderComponent} from './header/header.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
import {PortfolioComponent} from './portfolio/portfolio.component';

export const routes: Routes = [
    { path: 'header', component: HeaderComponent },
    { path: 'watchlist', component: WatchlistComponent },
    { path: 'portfolio', component: PortfolioComponent },
    {path: '', redirectTo: '/header', pathMatch: 'full'},
];

import { Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
import {PortfolioComponent} from './portfolio/portfolio.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
    { path: 'search', component: SearchComponent },
    { path: 'main', component: MainComponent},
    { path: 'watchlist', component: WatchlistComponent },
    { path: 'portfolio', component: PortfolioComponent },
    {path: '', redirectTo: '/search', pathMatch: 'full'}
];

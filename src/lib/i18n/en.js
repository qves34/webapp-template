/** English dictionary. Same keys as `cs`; plural entries use `one` / `other`. */
export const en = {
  'meta.description': 'Personal watchlist for movies, anime and series.',

  // ---------- general ----------
  'app.loading': 'Loading…',
  'app.mark': 'Watchlist',

  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.colorName.orange': 'Orange',
  'theme.colorName.blue': 'Blue',
  'theme.colorName.green': 'Green',
  'theme.colorName.purple': 'Purple',
  'lang.switchTo': 'Switch language to {lang}',

  // ---------- appearance panel ----------
  'appearance.button': 'Appearance',
  'appearance.themeHeading': 'Theme',
  'appearance.autoLabel': 'Switch automatically by time (dark 8pm-6am)',
  'appearance.colorHeading': 'Theme color',
  'appearance.bannerHeading': 'Side banners',
  'appearance.bannerEnable': 'Show side banners',
  'appearance.bannerColorful': 'Colorful',
  'appearance.bannerTrending': 'Trending',
  'appearance.bannerCustom': 'Custom',
  'appearance.bannerColorfulHint': 'Uses the theme color chosen above.',
  'appearance.bannerTrendingHint': 'A handful of currently trending titles (TMDB, AniList for anime).',
  'appearance.bannerCustomHint': 'Banner set from your list. Change it with the "Set as banner" button on a title.',
  'appearance.bannerCustomEmpty': 'Not set yet - open a title with a TMDB match in your list and click "Set as banner".',

  // ---------- kinds and statuses ----------
  'kind.film': 'Movie',
  'kind.anime': 'Anime',
  'kind.serial': 'Series',
  'kind.film.short': 'MOVIE',
  'kind.anime.short': 'ANIME',
  'kind.serial.short': 'SERIES',

  'status.chci': 'Want to watch',
  'status.divam': 'Watching',
  'status.pauza': 'On hold',
  'status.preruseno': 'Dropped',
  'status.hotovo': 'Finished',

  'sort.stav': 'Status',
  'sort.abeceda': 'A–Z',
  'sort.hodnoceni': 'Rating',

  // ---------- sign in ----------
  'auth.signIn': 'Sign in',
  'auth.signUp': 'Create account',
  'auth.toSignUp': "Don't have an account? Sign up",
  'auth.toSignIn': 'Already have an account? Sign in',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signOut': 'Sign out',

  'auth.errInvalidCredentials': 'Wrong email or password.',
  'auth.errEmailNotConfirmed': 'Your email is not confirmed yet. Check your inbox.',
  'auth.errUserExists': 'An account with this email already exists. Try signing in.',
  'auth.errWeakPassword': 'Password is too weak - it needs at least 6 characters.',
  'auth.errValidation': 'The email or password is not in a valid format.',
  'auth.errRateLimit': 'Too many attempts in a row. Try again in a moment.',
  'auth.errSignupDisabled': 'Sign-ups are disabled.',
  'auth.errNetwork': 'Could not reach the server. Check your connection.',
  'auth.errGeneric': 'Sign-in failed. Please try again.',

  // ---------- nickname ----------
  'nickname.title': 'Pick a nickname',
  'nickname.hint':
    'Friends will find you by it. 3-20 characters, letters, digits and underscore only.',
  'nickname.label': 'Nickname',
  'nickname.submit': 'Continue',
  'nickname.errFormat': '3-20 characters, letters, digits and underscore only.',
  'nickname.errTaken': 'That nickname is already taken.',
  'nickname.errGeneric': 'Could not save the nickname. Please try again.',

  // ---------- header ----------
  'nav.friends': 'Friends',
  'nav.profile': 'Profile',
  'nav.backFriends': '← Friends',
  'nav.backMine': '← Mine',

  'head.watchingNow': 'Watching now',
  'head.watching': 'In progress',
  'head.nothing': 'Nothing. Yet.',
  'head.queued': {
    one: 'Nothing. {count} waiting in the queue.',
    other: 'Nothing. {count} waiting in the queue.',
  },

  // ---------- add title ----------
  'add.titlePlaceholder': 'Title name',
  'add.kindAria': 'Type',
  'add.submit': 'Add',

  // ---------- toolbar ----------
  'toolbar.all': 'All',
  'toolbar.filterStatus': 'Filter by status',
  'toolbar.filterKind': 'Filter by type',
  'toolbar.sort': 'Sort',
  'toolbar.sortOption': 'Sort: {label}',
  'toolbar.search': 'Search',
  'toolbar.searchAria': 'Search the list',
  'toolbar.enterBatchMode': 'Enable batch selection',
  'toolbar.exitBatchMode': 'Disable batch selection',
  'toolbar.batchAction': 'Batch action…',
  'toolbar.selected': {
    one: '{count} title selected',
    other: '{count} titles selected',
  },

  // ---------- item row ----------
  'row.ratingTitle': 'Rated {rating} out of 10',
  'row.hated': 'Hated',
  'row.favorite': 'Favorite',
  'row.favoriteAdd': 'Add to favorites',
  'row.favoriteRemove': 'Remove from favorites',
  'row.statusSwitch': 'Switch to “{label}”',
  'row.edit': 'Edit',
  'row.editDone': 'Done',
  'row.delete': 'Delete title',
  'row.confirmDelete': 'Delete “{title}”?',
  'row.confirmBatchDelete': {
    one: 'Delete {count} title?',
    other: 'Delete {count} titles?',
  },
  'row.select': 'Select title',

  'field.title': 'Title',
  'field.kind': 'Type',
  'field.status': 'Status',
  'field.progress': 'Where you are',
  'field.rating': 'Rating',
  'field.ratingNone': 'Not rated',
  'field.note': 'Note',
  'field.notePlaceholder': 'Who recommended it, where it streams, what next… (Markdown: **bold**, *italic*, `code`, [link](url))',
  'field.posterUrl': 'Custom poster URL',
  'field.posterUrlPlaceholder': 'https://example.com/poster.jpg',
  'row.moveUp': 'Move up',
  'row.moveDown': 'Move down',
  'row.bannerPickerOpen': 'Set as banner',
  'row.bannerPickerClose': 'Close banner picker',
  'row.bannerPickerLoading': 'Loading posters…',
  'row.bannerPickerEmpty': 'TMDB has no other posters for this title.',
  'row.bannerPickerChoose': 'Choose this poster as banner',

  // ---------- empty list ----------
  'empty.vse': 'Nothing here yet. Type a title above and add your first one.',
  'empty.chci': 'Nothing queued up. Whatever you add starts here.',
  'empty.divam': 'Nothing in progress. Switch a title to “Watching”.',
  'empty.pauza': 'Nothing on hold. Park a title here through “Edit” to come back to it later.',
  'empty.preruseno': 'Nothing dropped. It can stay here in case you ever return to it.',
  'empty.hotovo': 'Nothing finished yet.',

  'list.loading': 'Loading your list…',
  'list.noMatch': 'Nothing matches “{query}”.',

  // ---------- sync ----------
  'sync.failed': 'Syncing with your account failed. Please try again.',

  'migration.prompt': {
    one: 'We found {count} title saved in this browser. Upload it to your account?',
    other: 'We found {count} titles saved in this browser. Upload them to your account?',
  },
  'migration.upload': 'Upload',
  'migration.dismiss': 'Leave it',
  'migration.done': 'Saved to your account: {count} of {total}.',

  // ---------- friends ----------
  'friends.heading': 'Friends',
  'friends.searchPlaceholder': 'Search by nickname',
  'friends.stateFriends': 'Friends',
  'friends.statePending': 'Request pending',
  'friends.stateIncoming': 'Waiting for you',
  'friends.add': 'Add',
  'friends.remove': 'Remove',
  'friends.cancel': 'Cancel',
  'friends.accept': 'Accept',
  'friends.decline': 'Decline',
  'friends.empty': 'No friends yet. Find them above by nickname.',
  'friends.incomingHeading': 'Friend requests',
  'friends.outgoingHeading': 'Sent requests',
  'friends.recommendations': 'You might know',
  'friends.requestSent': 'Request sent.',
  'friends.errDuplicate': 'That request already exists.',
  'friends.errGeneric': 'Could not send the request. Please try again.',
  'friends.shared': {
    one: '{count} title in common',
    other: '{count} titles in common',
  },
  'friends.sharedFavorites': {
    one: ' ({count} favorite)',
    other: ' ({count} favorites)',
  },
  'friends.watchlistOf': 'Watchlist of',
  'friends.loadFailed': 'Could not load the list.',
  'friends.watchlistEmpty': '{nickname} has an empty list so far.',

  // ---------- profile ----------
  'profile.accountHeading': 'Account',
  'profile.saveNickname': 'Save nickname',
  'profile.nicknameUpdated': 'Nickname saved.',
  'profile.bioLabel': 'About me',
  'profile.bioPlaceholder': 'A few words about you…',
  'profile.bioHint': 'Only your friends can see it, not anyone signed in.',
  'profile.saveBio': 'Save bio',
  'profile.bioUpdated': 'Bio saved.',
  'profile.bioErrLength': 'The bio is too long (max 200 characters).',
  'profile.bioErrGeneric': 'Could not save the bio. Please try again.',
  'profile.newPassword': 'New password',
  'profile.savePassword': 'Change password',
  'profile.passwordUpdated': 'Password changed.',
  'profile.bannerErrGeneric': 'Could not save the banner setting. Please try again.',
  'profile.favorites': 'Favorites',
  'profile.favoritesEmpty': 'No favorites yet.',
}

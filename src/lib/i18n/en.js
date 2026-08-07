/** English dictionary. Same keys as `cs`; plural entries use `one` / `other`. */
export const en = {
  'meta.description': 'Personal watchlist for movies, anime and series.',

  // ---------- general ----------
  'app.loading': 'Loading…',
  'app.mark': 'Watchlist',

  'theme.toLight': 'Switch to light mode',
  'theme.toDark': 'Switch to dark mode',
  'theme.light': 'Light mode',
  'theme.dark': 'Dark mode',
  'lang.switchTo': 'Switch language to {lang}',

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
  'action.export': 'Export',
  'action.import': 'Import',

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

  'field.title': 'Title',
  'field.kind': 'Type',
  'field.status': 'Status',
  'field.progress': 'Where you are',
  'field.rating': 'Rating',
  'field.ratingNone': 'Not rated',
  'field.note': 'Note',
  'field.notePlaceholder': 'Who recommended it, where it streams, what next…',

  // ---------- empty list ----------
  'empty.vse': 'Nothing here yet. Type a title above and add your first one.',
  'empty.chci': 'Nothing queued up. Whatever you add starts here.',
  'empty.divam': 'Nothing in progress. Switch a title to “Watching”.',
  'empty.pauza': 'Nothing on hold. Park a title here through “Edit” to come back to it later.',
  'empty.preruseno': 'Nothing dropped. It can stay here in case you ever return to it.',
  'empty.hotovo': 'Nothing finished yet.',

  'list.loading': 'Loading your list…',
  'list.noMatch': 'Nothing matches “{query}”.',

  // ---------- backup and sync ----------
  'export.empty': 'Nothing to back up, the list is empty.',
  'export.done': {
    one: 'Downloaded {count} title.',
    other: 'Downloaded {count} titles.',
  },
  'import.nothingNew': 'The backup brought nothing new.',
  'import.merged': 'Added {added}, updated {updated}.',
  'import.failed': 'Import failed: {reason}',
  'import.errNoList': 'The file does not contain a list of titles.',
  'import.errNoTitles': 'The file has no title with a name.',
  'import.errBadFile': 'The file cannot be read as JSON.',

  'sync.failed': 'Syncing with your account failed. Try again, and export a backup meanwhile.',
  'foot.data': 'Your data lives with your account, available anywhere. Export gives you a backup.',

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
  'profile.newPassword': 'New password',
  'profile.savePassword': 'Change password',
  'profile.passwordUpdated': 'Password changed.',
  'profile.favorites': 'Favorites',
  'profile.favoritesEmpty': 'No favorites yet.',
}

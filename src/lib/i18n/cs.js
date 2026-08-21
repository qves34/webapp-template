/**
 * Český slovník. Hodnota je buď text, nebo objekt s plurálovými tvary
 * (`one` = 1, `few` = 2-4, `other` = 5+) - tvar vybere Intl.PluralRules podle `count`.
 */
export const cs = {
  'meta.description': 'Osobní watchlist na filmy, anime a seriály.',

  // ---------- obecné ----------
  'app.loading': 'Načítám…',
  'app.mark': 'Watchlist',

  'theme.light': 'Světlý',
  'theme.dark': 'Tmavý',
  'theme.colorName.orange': 'Oranžová',
  'theme.colorName.blue': 'Modrá',
  'theme.colorName.green': 'Zelená',
  'theme.colorName.purple': 'Fialová',
  'lang.switchTo': 'Přepnout jazyk na {lang}',

  // ---------- panel Vzhled ----------
  'appearance.button': 'Vzhled',
  'appearance.themeHeading': 'Motiv',
  'appearance.autoLabel': 'Přepínat automaticky podle času (20:00-6:00 tmavý)',
  'appearance.colorHeading': 'Barva tématu',
  'appearance.bannerHeading': 'Postranní bannery',
  'appearance.bannerEnable': 'Zobrazit postranní bannery',
  'appearance.bannerColorful': 'Barevné',
  'appearance.bannerMovies': 'Z filmů',
  'appearance.bannerColorfulHint': 'Používá barvu tématu zvolenou výše.',
  'appearance.bannerMoviesPlaceholder': 'Připravujeme - výběr několika nejslavnějších titulů, zatím není k dispozici.',

  // ---------- typy a stavy ----------
  'kind.film': 'Film',
  'kind.anime': 'Anime',
  'kind.serial': 'Seriál',
  'kind.film.short': 'FILM',
  'kind.anime.short': 'ANIME',
  'kind.serial.short': 'SERIÁL',

  'status.chci': 'Chci vidět',
  'status.divam': 'Dívám se',
  'status.pauza': 'Dočasně přerušeno',
  'status.preruseno': 'Přerušeno',
  'status.hotovo': 'Dokoukáno',

  'sort.stav': 'Stav',
  'sort.abeceda': 'Abecedně',
  'sort.hodnoceni': 'Hodnocení',

  // ---------- přihlášení ----------
  'auth.signIn': 'Přihlásit se',
  'auth.signUp': 'Vytvořit účet',
  'auth.toSignUp': 'Nemáš účet? Zaregistruj se',
  'auth.toSignIn': 'Už máš účet? Přihlas se',
  'auth.email': 'Email',
  'auth.password': 'Heslo',
  'auth.signOut': 'Odhlásit se',

  'auth.errInvalidCredentials': 'Špatný email nebo heslo.',
  'auth.errEmailNotConfirmed': 'Email ještě není potvrzený. Mrkni do schránky.',
  'auth.errUserExists': 'Účet s tímhle emailem už existuje. Zkus se přihlásit.',
  'auth.errWeakPassword': 'Heslo je moc slabé - potřebuje aspoň 6 znaků.',
  'auth.errValidation': 'Email nebo heslo nemá správný tvar.',
  'auth.errRateLimit': 'Moc pokusů za sebou. Zkus to za chvíli znovu.',
  'auth.errSignupDisabled': 'Registrace je vypnutá.',
  'auth.errNetwork': 'Nepodařilo se spojit se serverem. Zkontroluj připojení.',
  'auth.errGeneric': 'Přihlášení se nepovedlo. Zkus to prosím znovu.',

  // ---------- nickname ----------
  'nickname.title': 'Zvol si nickname',
  'nickname.hint': 'Podle něj tě budou hledat přátelé. 3-20 znaků, jen písmena, čísla a podtržítko.',
  'nickname.label': 'Nickname',
  'nickname.submit': 'Pokračovat',
  'nickname.errFormat': '3-20 znaků, jen písmena, čísla a podtržítko.',
  'nickname.errTaken': 'Tenhle nickname už je zabraný.',
  'nickname.errGeneric': 'Nickname se nepodařilo uložit. Zkus to prosím znovu.',

  // ---------- hlavička ----------
  'nav.friends': 'Přátelé',
  'nav.profile': 'Profil',
  'nav.backFriends': '← Přátelé',
  'nav.backMine': '← Moje',

  'head.watchingNow': 'Právě koukám',
  'head.watching': 'Rozkoukané',
  'head.nothing': 'Nic. Zatím.',
  'head.queued': {
    one: 'Nic. Ve frontě čeká {count}.',
    few: 'Nic. Ve frontě čekají {count}.',
    other: 'Nic. Ve frontě čeká {count}.',
  },

  // ---------- přidání titulu ----------
  'add.titlePlaceholder': 'Název titulu',
  'add.kindAria': 'Typ',
  'add.submit': 'Přidat',

  // ---------- lišta ----------
  'toolbar.all': 'Vše',
  'toolbar.filterStatus': 'Filtr podle stavu',
  'toolbar.filterKind': 'Filtr podle typu',
  'toolbar.sort': 'Řadit',
  'toolbar.sortOption': 'Řadit: {label}',
  'toolbar.search': 'Hledat',
  'toolbar.searchAria': 'Hledat v seznamu',
  'toolbar.enterBatchMode': 'Zapnout hromadný výběr',
  'toolbar.exitBatchMode': 'Vypnout hromadný výběr',
  'toolbar.batchAction': 'Hromadná akce…',
  'toolbar.selected': {
    one: 'Vybraný {count} titul',
    few: 'Vybrané {count} tituly',
    other: 'Vybraných {count} titulů',
  },

  // ---------- řádek titulu ----------
  'row.ratingTitle': 'Hodnocení {rating} z 10',
  'row.hated': 'Nesnášeno',
  'row.favorite': 'Oblíbené',
  'row.favoriteAdd': 'Přidat do oblíbených',
  'row.favoriteRemove': 'Odebrat z oblíbených',
  'row.statusSwitch': 'Přepnout na „{label}“',
  'row.edit': 'Upravit',
  'row.editDone': 'Hotovo',
  'row.delete': 'Smazat titul',
  'row.confirmDelete': 'Smazat „{title}“?',
  'row.confirmBatchDelete': {
    one: 'Smazat {count} titul?',
    few: 'Smazat {count} tituly?',
    other: 'Smazat {count} titulů?',
  },
  'row.select': 'Vybrat titul',
  'row.moveUp': 'Posunout nahoru',
  'row.moveDown': 'Posunout dolů',

  'field.title': 'Název',
  'field.kind': 'Typ',
  'field.status': 'Stav',
  'field.progress': 'Kde jsi',
  'field.rating': 'Hodnocení',
  'field.ratingNone': 'Zatím nic',
  'field.note': 'Poznámka',
  'field.notePlaceholder': 'Kdo to doporučil, kde to běží, co dál… (Markdown: **bold**, *italic*, `code`, [link](url))',
  'field.posterUrl': 'URL vlastního plakátku',
  'field.posterUrlPlaceholder': 'https://example.com/poster.jpg',

  // ---------- prázdný seznam ----------
  'empty.vse': 'Zatím prázdno. Napiš nahoru název a přidej první titul.',
  'empty.chci': 'Nic tu nečeká. Co přidáš, začíná tady.',
  'empty.divam': 'Nic rozkoukaného. U titulu přepni stav na „Dívám se“.',
  'empty.pauza': 'Nic v pauze. Titul, ke kterému se chceš vrátit, sem přepneš přes „Upravit“.',
  'empty.preruseno': 'Nic přerušeného. Klidně tu ale zůstane, kdyby ses k tomu vrátil.',
  'empty.hotovo': 'Zatím nic dokoukaného.',

  'list.loading': 'Načítám tvůj seznam…',
  'list.noMatch': 'Na „{query}“ nic nesedí.',

  // ---------- sync ----------
  'sync.failed': 'Synchronizace s účtem selhala. Zkus to prosím znovu.',

  'migration.prompt': {
    one: 'Našli jsme {count} titul uložený v tomhle prohlížeči. Nahrát ho do účtu?',
    few: 'Našli jsme {count} tituly uložené v tomhle prohlížeči. Nahrát je do účtu?',
    other: 'Našli jsme {count} titulů uložených v tomhle prohlížeči. Nahrát je do účtu?',
  },
  'migration.upload': 'Nahrát',
  'migration.dismiss': 'Nechat být',
  'migration.done': 'Uloženo do účtu: {count} z {total}.',

  // ---------- přátelé ----------
  'friends.heading': 'Přátelé',
  'friends.searchPlaceholder': 'Hledat podle nicku',
  'friends.stateFriends': 'Přátelé',
  'friends.statePending': 'Žádost čeká',
  'friends.stateIncoming': 'Čeká na tebe',
  'friends.add': 'Přidat',
  'friends.remove': 'Odebrat',
  'friends.cancel': 'Zrušit',
  'friends.accept': 'Přijmout',
  'friends.decline': 'Odmítnout',
  'friends.empty': 'Zatím žádní přátelé. Najdi je výše podle nicku.',
  'friends.incomingHeading': 'Žádosti o přátelství',
  'friends.outgoingHeading': 'Odeslané žádosti',
  'friends.recommendations': 'Možná znáš',
  'friends.requestSent': 'Žádost odeslána.',
  'friends.errDuplicate': 'Žádost už existuje.',
  'friends.errGeneric': 'Žádost se nepodařilo odeslat. Zkus to prosím znovu.',
  'friends.shared': {
    one: '{count} společný titul',
    few: '{count} společné tituly',
    other: '{count} společných titulů',
  },
  'friends.sharedFavorites': {
    one: ' ({count} oblíbený)',
    few: ' ({count} oblíbené)',
    other: ' ({count} oblíbených)',
  },
  'friends.watchlistOf': 'Watchlist uživatele',
  'friends.loadFailed': 'Seznam se nepodařilo načíst.',
  'friends.watchlistEmpty': '{nickname} má zatím prázdný seznam.',

  // ---------- profil ----------
  'profile.accountHeading': 'Účet',
  'profile.saveNickname': 'Uložit nickname',
  'profile.nicknameUpdated': 'Nickname uložen.',
  'profile.bioLabel': 'O mně',
  'profile.bioPlaceholder': 'Pár slov o tobě…',
  'profile.bioHint': 'Uvidí ho jen tví přátelé, ne kdokoli přihlášený.',
  'profile.saveBio': 'Uložit popis',
  'profile.bioUpdated': 'Popis uložen.',
  'profile.bioErrLength': 'Popis je moc dlouhý (max 200 znaků).',
  'profile.bioErrGeneric': 'Popis se nepodařilo uložit. Zkus to prosím znovu.',
  'profile.newPassword': 'Nové heslo',
  'profile.savePassword': 'Změnit heslo',
  'profile.passwordUpdated': 'Heslo změněno.',
  'profile.bannerErrGeneric': 'Nastavení banneru se nepodařilo uložit. Zkus to prosím znovu.',
  'profile.favorites': 'Oblíbené',
  'profile.favoritesEmpty': 'Zatím žádné oblíbené položky.',
}

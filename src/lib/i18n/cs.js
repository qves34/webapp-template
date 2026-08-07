/**
 * Český slovník. Hodnota je buď text, nebo objekt s plurálovými tvary
 * (`one` = 1, `few` = 2-4, `other` = 5+) - tvar vybere Intl.PluralRules podle `count`.
 */
export const cs = {
  'meta.description': 'Osobní watchlist na filmy, anime a seriály.',

  // ---------- obecné ----------
  'app.loading': 'Načítám…',
  'app.mark': 'Watchlist',

  'theme.toLight': 'Přepnout na světlý režim',
  'theme.toDark': 'Přepnout na tmavý režim',
  'theme.light': 'Světlý režim',
  'theme.dark': 'Tmavý režim',
  'lang.switchTo': 'Přepnout jazyk na {lang}',

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
  'action.export': 'Export',
  'action.import': 'Import',

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

  'field.title': 'Název',
  'field.kind': 'Typ',
  'field.status': 'Stav',
  'field.progress': 'Kde jsi',
  'field.rating': 'Hodnocení',
  'field.ratingNone': 'Zatím nic',
  'field.note': 'Poznámka',
  'field.notePlaceholder': 'Kdo to doporučil, kde to běží, co dál…',

  // ---------- prázdný seznam ----------
  'empty.vse': 'Zatím prázdno. Napiš nahoru název a přidej první titul.',
  'empty.chci': 'Nic tu nečeká. Co přidáš, začíná tady.',
  'empty.divam': 'Nic rozkoukaného. U titulu přepni stav na „Dívám se“.',
  'empty.pauza': 'Nic v pauze. Titul, ke kterému se chceš vrátit, sem přepneš přes „Upravit“.',
  'empty.preruseno': 'Nic přerušeného. Klidně tu ale zůstane, kdyby ses k tomu vrátil.',
  'empty.hotovo': 'Zatím nic dokoukaného.',

  'list.loading': 'Načítám tvůj seznam…',
  'list.noMatch': 'Na „{query}“ nic nesedí.',

  // ---------- záloha a sync ----------
  'export.empty': 'Není co zálohovat, seznam je prázdný.',
  'export.done': {
    one: 'Stažen {count} titul.',
    few: 'Staženy {count} tituly.',
    other: 'Staženo {count} titulů.',
  },
  'import.nothingNew': 'Záloha nepřinesla nic nového.',
  'import.merged': 'Přidáno {added}, aktualizováno {updated}.',
  'import.failed': 'Import se nepovedl: {reason}',
  'import.errNoList': 'Soubor neobsahuje seznam titulů.',
  'import.errNoTitles': 'V souboru není žádný titul s názvem.',
  'import.errBadFile': 'Soubor nejde přečíst jako JSON.',

  'sync.failed': 'Synchronizace s účtem selhala. Zkus to znovu, mezitím si radši udělej Export.',
  'foot.data': 'Data jsou u tvého účtu, dostupná odkudkoli. Zálohu si navíc uděláš přes Export.',

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
  'profile.favorites': 'Oblíbené',
  'profile.favoritesEmpty': 'Zatím žádné oblíbené položky.',
}

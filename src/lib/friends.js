/** Otočí řádek friendships na tvar orientovaný vůči přihlášenému uživateli. */
export function rowToFriendship(row, ownId) {
  const incoming = row.addressee_id === ownId
  return {
    id: row.id,
    status: row.status,
    otherId: incoming ? row.requester_id : row.addressee_id,
    incoming,
  }
}

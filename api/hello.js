export default function handler(req, res) {
  res.status(200).json({
    message: 'Ahoj z backendu!',
    time: new Date().toISOString(),
  });
}

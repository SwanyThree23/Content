const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backup = () => {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `backup-${timestamp}.sql`;
  const backupPath = path.join(__dirname, '..', 'backups', filename);

  if (!fs.existsSync(path.dirname(backupPath))) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  }

  exec(`pg_dump ${process.env.DATABASE_URL} > ${backupPath}`, (error) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    console.log('Backup created:', filename);

    // Optional: Upload to S3/R2 or backup service
    // uploadToStorage(backupPath);
  });
};

backup();

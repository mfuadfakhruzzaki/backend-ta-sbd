-- Membuat database (hapus komentar jika ingin membuat database baru)
-- CREATE DATABASE marketplace;
-- USE marketplace;

-- Tabel USER
CREATE TABLE USER (
    user_id INT(10) NOT NULL AUTO_INCREMENT,
    nama VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    profile_picture VARCHAR(255),
    nomor_telepon VARCHAR(15),
    alamat TEXT,
    kampus VARCHAR(100),
    role VARCHAR(20),
    status_akun VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- Membuat indeks pada email untuk USER
CREATE INDEX INDEX_1v1 ON USER (email);

-- Tabel KATEGORI
CREATE TABLE KATEGORI (
    kategori_id INT(10) NOT NULL AUTO_INCREMENT,
    nama_kategori VARCHAR(50),
    deskripsi TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (kategori_id)
);

-- Membuat indeks pada nama_kategori untuk KATEGORI
CREATE INDEX idx_kategori_nama ON KATEGORI (nama_kategori);

-- Tabel BARANG
CREATE TABLE BARANG (
    barang_id INT(10) NOT NULL AUTO_INCREMENT,
    user_id INT(10),
    kategori_id INT(10),
    judul VARCHAR(100),
    deskripsi TEXT,
    foto TEXT,
    harga DECIMAL(10,2),
    lokasi VARCHAR(100),
    kondisi VARCHAR(20),
    views_count INT(10),
    status VARCHAR(20),
    status_delete INT(1),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (barang_id),
    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (kategori_id) REFERENCES KATEGORI(kategori_id)
);

-- Membuat indeks untuk BARANG
CREATE INDEX fk_barang_kategori ON BARANG (kategori_id);
CREATE INDEX fk_barang_user ON BARANG (user_id);
CREATE INDEX idx_barang_kategori ON BARANG (kategori_id);
CREATE INDEX idx_barang_user ON BARANG (user_id);
CREATE INDEX idx_barang_status ON BARANG (status);
CREATE INDEX idx_barang_kondisi ON BARANG (kondisi);
CREATE INDEX idx_barang_harga ON BARANG (harga);
CREATE INDEX idx_barang_created_at ON BARANG (created_at);

-- Tabel WISHLIST
CREATE TABLE WISHLIST (
    wishlist_id INT(10) NOT NULL AUTO_INCREMENT,
    user_id INT(10),
    barang_id INT(10),
    created_at TIMESTAMP,
    PRIMARY KEY (wishlist_id),
    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (barang_id) REFERENCES BARANG(barang_id)
);

-- Membuat indeks untuk WISHLIST
CREATE INDEX fk_wishlist_barang ON WISHLIST (barang_id);
CREATE INDEX fk_wishlist_user ON WISHLIST (user_id);
CREATE INDEX idx_wishlist_user ON WISHLIST (user_id);
CREATE INDEX idx_wishlist_barang ON WISHLIST (barang_id);
CREATE UNIQUE INDEX unique_wishlist ON WISHLIST (user_id, barang_id);

-- Tabel TRANSAKSI
CREATE TABLE TRANSAKSI (
    transaksi_id INT(10) NOT NULL AUTO_INCREMENT,
    barang_id INT(10),
    seller_id INT(10),
    buyer_id INT(10),
    tanggal_transaksi TIMESTAMP,
    metode_pembayaran VARCHAR(50),
    total_harga DECIMAL(10,2),
    status VARCHAR(20),
    catatan TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (transaksi_id),
    FOREIGN KEY (barang_id) REFERENCES BARANG(barang_id),
    FOREIGN KEY (seller_id) REFERENCES USER(user_id),
    FOREIGN KEY (buyer_id) REFERENCES USER(user_id)
);

-- Membuat indeks untuk TRANSAKSI
CREATE INDEX fk_transaksi_barang ON TRANSAKSI (barang_id);
CREATE INDEX fk_transaksi_buyer ON TRANSAKSI (buyer_id);
CREATE INDEX fk_transaksi_seller ON TRANSAKSI (seller_id);
CREATE INDEX idx_transaksi_barang ON TRANSAKSI (barang_id);
CREATE INDEX idx_transaksi_seller ON TRANSAKSI (seller_id);
CREATE INDEX idx_transaksi_buyer ON TRANSAKSI (buyer_id);
CREATE INDEX idx_transaksi_status ON TRANSAKSI (status);
CREATE INDEX idx_transaksi_tanggal ON TRANSAKSI (tanggal_transaksi);

-- Tabel RATING
CREATE TABLE RATING (
    rating_id INT(10) NOT NULL AUTO_INCREMENT,
    transaksi_id INT(10),
    reviewer_id INT(10),
    reviewed_id INT(10),
    nilai INT(2),
    review TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (rating_id),
    FOREIGN KEY (transaksi_id) REFERENCES TRANSAKSI(transaksi_id),
    FOREIGN KEY (reviewer_id) REFERENCES USER(user_id),
    FOREIGN KEY (reviewed_id) REFERENCES USER(user_id)
);

-- Membuat indeks untuk RATING
CREATE INDEX INDEX_1 ON RATING (transaksi_id);
CREATE INDEX fk_rating_reviewed ON RATING (reviewed_id);
CREATE INDEX fk_rating_reviewer ON RATING (reviewer_id);
CREATE INDEX fk_rating_transaksi ON RATING (transaksi_id);
CREATE INDEX idx_rating_transaksi ON RATING (transaksi_id);
CREATE INDEX idx_rating_reviewer ON RATING (reviewer_id);
CREATE INDEX idx_rating_reviewed ON RATING (reviewed_id);

-- Tabel CHAT
CREATE TABLE CHAT (
    chat_id INT(10) NOT NULL AUTO_INCREMENT,
    sender_id INT(10),
    receiver_id INT(10),
    barang_id INT(10),
    pesan TEXT,
    status_dibaca INT(1),
    tanggal TIMESTAMP,
    PRIMARY KEY (chat_id),
    FOREIGN KEY (sender_id) REFERENCES USER(user_id),
    FOREIGN KEY (receiver_id) REFERENCES USER(user_id),
    FOREIGN KEY (barang_id) REFERENCES BARANG(barang_id)
);

-- Membuat indeks untuk CHAT
CREATE INDEX fk_chat_barang ON CHAT (barang_id);
CREATE INDEX fk_chat_receiver ON CHAT (receiver_id);
CREATE INDEX fk_chat_sender ON CHAT (sender_id);
CREATE INDEX idx_chat_sender ON CHAT (sender_id);
CREATE INDEX idx_chat_receiver ON CHAT (receiver_id);
CREATE INDEX idx_chat_barang ON CHAT (barang_id);
CREATE INDEX idx_chat_tanggal ON CHAT (tanggal);

-- Tabel LAPORAN
CREATE TABLE LAPORAN (
    laporan_id INT(10) NOT NULL AUTO_INCREMENT,
    reporter_id INT(10),
    item_type VARCHAR(20),
    reported_item_id INT(10),
    alasan TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (laporan_id),
    FOREIGN KEY (reporter_id) REFERENCES USER(user_id)
);

-- Membuat indeks untuk LAPORAN
CREATE INDEX fk_laporan_reporter ON LAPORAN (reporter_id);
CREATE INDEX idx_laporan_reporter ON LAPORAN (reporter_id);
CREATE INDEX idx_laporan_item_type ON LAPORAN (item_type);
CREATE INDEX idx_laporan_status ON LAPORAN (status);

-- Tabel NOTIFIKASI
CREATE TABLE NOTIFIKASI (
    notifikasi_id INT(10) NOT NULL AUTO_INCREMENT,
    user_id INT(10),
    judul VARCHAR(100),
    pesan TEXT,
    jenis VARCHAR(20),
    is_read INT(1),
    created_at TIMESTAMP,
    PRIMARY KEY (notifikasi_id),
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

-- Membuat indeks untuk NOTIFIKASI
CREATE INDEX fk_notifikasi_user ON NOTIFIKASI (user_id);
CREATE INDEX idx_notifikasi_user ON NOTIFIKASI (user_id);
CREATE INDEX idx_notifikasi_is_read ON NOTIFIKASI (is_read);
CREATE INDEX idx_notifikasi_created_at ON NOTIFIKASI (created_at);
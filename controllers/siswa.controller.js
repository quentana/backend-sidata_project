const Validator = require("fastest-validator");
const v = new Validator();
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');

const {
    DataSiswa, Jurusan, Rayon, Romble, User, Approved,
    TahunAjaran, Semester, DataKeluarga, DataAyah, DataIbu, DataWali, Dokumen
} = require('../models');
const { response } = require('../helpers/response.formatter');

const includeRelasi = [
    { model: Approved, as: 'approved', attributes: ['id', 'status', 'catatan'] },
    { model: Jurusan, as: 'jurusan', attributes: ['id', 'nama_jurusan', 'kode_jurusan'] },
    { model: Rayon, as: 'rayon', attributes: ['id', 'nama_rayon'] },
    { model: Romble, as: 'romble', attributes: ['id', 'nama_romble', 'kode_romble'] },
    { model: User, as: 'user', attributes: ['name', 'email', 'rayon_id'] }, // Ditambahkan rayon_id
    { model: TahunAjaran, as: 'TahunAjaran', attributes: ['id', 'nama'] },
    { model: Semester, as: 'Semester', attributes: ['id', 'nama'] },
];

module.exports = {
   getAll: async (req, res) => {
    try {
        const where = {};
        // filter berdasarkan role
        if (req.user.role === 'user') {
            // Siswa hanya bisa melihat datanya sendiri
            where.user_id = req.user.id;
        } else if (req.user.role === 'admin') {
            // Pembimbing hanya bisa melihat siswa dalam rayon yang sama
            if (!req.user.rayon_id) {
                return res.status(200).json(
                    response(200, "Success", {
                        data: [],
                        limit: 0,
                        rows: "0-0",
                        total: 0,
                        page: 1,
                        totalPages: 0
                    })
                );
            }
            where.rayon_id = req.user.rayon_id;
        }
        const {
            search = "",
            sort = "createdAt",
            order = "DESC",
            page = 1,
            limit = 10,
            jurusan_id,
            romble_id,
            all
        } = req.query;

        const isFetchAll = all === "true";

        if (jurusan_id) {
            where.jurusan_id = jurusan_id;
        }

        if (romble_id) {
            where.romble_id = romble_id;
        }

        if (search) {
            where[Op.or] = [
                {
                    nama_lengkap: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    nisn: {
                        [Op.like]: `%${search}%`
                    }
                }
            ];
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;

        const queryOptions = {
            where,
            include: includeRelasi,
            order: [[sort, order.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
            distinct: true
        };

        if (!isFetchAll) {
            queryOptions.limit = limitNum;
            queryOptions.offset = offset;
        }

        const { count, rows } = await DataSiswa.findAndCountAll(queryOptions);

        const formatPagination = {
            data: rows,
            limit: isFetchAll ? rows.length : limitNum,
            rows: rows.length > 0
                ? isFetchAll
                    ? `1-${rows.length}`
                    : `${offset + 1}-${offset + rows.length}`
                : "0-0",
            total: count,
            page: isFetchAll ? 1 : pageNum,
            totalPages: isFetchAll
                ? 1
                : Math.ceil(count / limitNum)
        };
        return res.status(200).json(response(200, "Success", formatPagination));

    } catch (error) {
        return res.status(500).json(response(500, "Server Error di getAll Siswa", error.message));
    }
},

    getOne: async (req, res) => {
        try {
            const data = await DataSiswa.findByPk(req.params.id, { include: includeRelasi });
            if (!data) return res.status(404).json(response(404, "Not Found", "Data siswa tidak ditemukan"));

            //proteksi data agar siswa lain tidak bisa menembak ID siswa lain via URL
            if (req.user.role === 'user' && data.user_id !== req.user.id) {
                return res.status(403).json(response(403, "Forbidden", "Anda tidak memiliki akses ke data ini."));
            }
            //proteksi agar pembimbing tidak bisa melihat siswa rayon lain
            if (req.user.role === 'admin' && data.rayon_id !== req.user.rayon_id) {
                return res.status(403).json(response(403, "Forbidden", "Siswa ini di luar rayon kekuasaan Anda."));
            }
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    create: async (req, res) => {
        try {
            // Validasi input
            const schema = {
                nisn: { type: "string", min: 3 },
                nama_lengkap: { type: "string", min: 3 },
                jurusan_id: { type: "number", positive: true, integer: true },
                romble_id: { type: "number", positive: true, integer: true },
                jenis_kelamin: { type: "string" },
                tempat_lahir: { type: "string", min: 3 },
                tanggal_lahir: { type: "string", min: 3 },
            };

            const dataValidate = {
                nisn: req.body.nisn,
                nama_lengkap: req.body.nama_lengkap,
                jurusan_id: Number(req.body.jurusan_id),
                romble_id: Number(req.body.romble_id),
                jenis_kelamin: req.body.jenis_kelamin,
                tempat_lahir: req.body.tempat_lahir,
                tanggal_lahir: req.body.tanggal_lahir,
            };

            const validate = v.validate(dataValidate, schema);
            if (validate.length > 0) return res.status(400).json(response(400, "Validation Error", validate));

            //cek apakah akun user ini sudah pernah mengisi biodata siswa
            const existingData = await DataSiswa.findOne({ where: { user_id: req.user.id } });
            if (existingData) {
                return res.status(400).json(response(400, "Bad Request", "Akun Anda sudah terikat dengan data siswa yang ada."));
            }

            //ambil automatis rayon dari akun user (AUTH)
            const userAccount = await User.findByPk(req.user.id);
            if (!userAccount || !userAccount.rayon_id) {
                return res.status(400).json(response(400, "Validation Error", "Akun Anda belum dikonfigurasi masuk ke Rayon manapun oleh Admin."));
            }
            const foto = req.file ? req.file.filename : null;
            const tahunAktif = await TahunAjaran.findOne({ where: { is_active: true } });
            const semesterAktif = await Semester.findOne({ where: { is_active: true } });
            const data = await DataSiswa.create({
                ...req.body,
                user_id: req.user.id, // Menyambung ke ID login
                rayon_id: userAccount.rayon_id, // OTOMATIS mengunci rayon dari registrasi akun awal
                foto,
                jurusan_id: Number(req.body.jurusan_id),
                romble_id: Number(req.body.romble_id),
                tahun_ajaran_id: tahunAktif ? tahunAktif.id : null,
                semester_id: semesterAktif ? semesterAktif.id : null,
            });
            await Approved.create({ siswa_id: data.id, status: 'pending' });
            return res.status(201).json(response(201, "Created", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    update: async (req, res) => {
        try {
            const data = await DataSiswa.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404, "Not Found", "Data siswa tidak ditemukan"));
            if (req.user.role === 'user' && data.user_id !== req.user.id) {
                return res.status(403).json(response(403, "Forbidden", "Akses ditolak."));
            }
            if (req.file && data.getDataValue('foto')) {
                const oldPath = path.join(__dirname, '../uploads', data.getDataValue('foto'));
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            const foto = req.file ? req.file.filename : data.getDataValue('foto');
            const { rayon_id, user_id, ...updatePayload } = req.body;
            await data.update({ ...updatePayload, foto });
            return res.status(200).json(response(200, "Updated", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    destroy: async (req, res) => {
        try {
            const data = await DataSiswa.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404, "Not Found", "Data siswa tidak ditemukan"));

            if (data.getDataValue('foto')) {
                const fp = path.join(__dirname, '../uploads', data.getDataValue('foto'));
                if (fs.existsSync(fp)) fs.unlinkSync(fp);
            }
            await data.destroy();
            return res.status(200).json(response(200, "Deleted"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    exportExcel: async (req, res) => {
        try {
            const where = {};
            if (req.user.role === 'admin' && req.user.rayon_id) where.rayon_id = req.user.rayon_id;
            if (req.user.role === 'user') where.user_id = req.user.id;

            const siswas = await DataSiswa.findAll({
                where, include: [
                    { model: Jurusan, as: 'jurusan' }, { model: Rayon, as: 'rayon' }, { model: Romble, as: 'romble' },
                    { model: Approved, as: 'approved', attributes: ['status'] },
                ]
            });

            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Data Siswa');
            ws.columns = [
                { header: 'No', key: 'no', width: 5 }, { header: 'NISN', key: 'nisn', width: 20 },
                { header: 'Nama Lengkap', key: 'nama', width: 30 }, { header: 'Jurusan', key: 'jurusan', width: 20 },
                { header: 'Rayon', key: 'rayon', width: 15 }, { header: 'Romble', key: 'romble', width: 15 },
                { header: 'Jenis Kelamin', key: 'jk', width: 15 }, { header: 'Status', key: 'status', width: 12 },
            ];
            ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
            ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };

            siswas.forEach((s, i) => ws.addRow({
                no: i + 1, nisn: s.nisn, nama: s.nama_lengkap,
                jurusan: s.jurusan?.nama_jurusan || '-', rayon: s.rayon?.nama_rayon || '-',
                romble: s.romble?.nama_romble || '-',
                jk: s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                status: s.approved?.status || 'pending',
            }));

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=data-siswa.xlsx');
            await wb.xlsx.write(res); res.end();
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    exportPDF: async (req, res) => {
        try {
            const where = {};
            if (req.user.role === 'admin' && req.user.rayon_id) where.rayon_id = req.user.rayon_id;
            if (req.user.role === 'user') where.user_id = req.user.id;

            const siswas = await DataSiswa.findAll({
                where, include: [
                    { model: Jurusan, as: 'jurusan' }, { model: Rayon, as: 'rayon' }, { model: Romble, as: 'romble' },
                    { model: Approved, as: 'approved' }
                ]
            });

            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=data-siswa.pdf');
            doc.pipe(res);
            doc.fontSize(14).font('Helvetica-Bold').text('DATA SISWA - SIDATA', { align: 'center' });
            doc.moveDown();
            let y = 80;
            const cols = { no: 30, nisn: 55, nama: 130, jurusan: 270, rayon: 380, romble: 460, jk: 545, status: 690 };
            doc.fontSize(9).font('Helvetica-Bold');
            Object.entries({ no: 'No', nisn: 'NISN', nama: 'Nama', jurusan: 'Jurusan', rayon: 'Rayon', romble: 'Romble', jk: 'JK', status: 'Status' })
                .forEach(([k, l]) => doc.text(l, cols[k], y));
            doc.moveTo(30, y + 13).lineTo(790, y + 13).stroke();
            y += 20; doc.font('Helvetica').fontSize(8);

            siswas.forEach((s, i) => {
                if (y > 530) { doc.addPage(); y = 40; }
                doc.text(String(i + 1), cols.no, y);
                doc.text(s.nisn || '-', cols.nisn, y);
                doc.text(s.nama_lengkap || '-', cols.nama, y, { width: 130 });
                doc.text(s.jurusan?.nama_jurusan || '-', cols.jurusan, y, { width: 100 });
                doc.text(s.rayon?.nama_rayon || '-', cols.rayon, y, { width: 70 });
                doc.text(s.romble?.nama_romble || '-', cols.romble, y);
                doc.text(s.jenis_kelamin === 'L' ? 'L' : 'P', cols.jk, y);
                doc.text(s.approved?.status || 'pending', cols.status, y);
                doc.moveTo(30, y + 15).lineTo(790, y + 15).strokeColor('#dddddd').stroke();
                y += 18;
            });
            doc.end();
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    exportExcelSingle: async (req, res) => {
        try {
            const siswa = await DataSiswa.findByPk(req.params.id, {
                include: [
                    { model: Jurusan, as: 'jurusan' }, { model: Rayon, as: 'rayon' }, { model: Romble, as: 'romble' },
                    { model: Approved, as: 'approved', attributes: ['status', 'catatan'] },
                    { model: TahunAjaran, as: 'TahunAjaran', attributes: ['nama'] },
                    { model: Semester, as: 'Semester', attributes: ['nama'] },
                ]
            });
            if (!siswa) return res.status(404).json(response(404, "Data siswa tidak ditemukan"));

            // Validasi hak akses sebelum export berkas single
            if (req.user.role === 'user' && siswa.user_id !== req.user.id) return res.status(403).json(response(403, "Forbidden"));
            if (req.user.role === 'admin' && siswa.rayon_id !== req.user.rayon_id) return res.status(403).json(response(403, "Forbidden"));

            const keluarga = await DataKeluarga.findOne({
                where: { siswa_id: siswa.id }, include: [
                    { model: DataAyah, as: 'ayah' }, { model: DataIbu, as: 'ibu' }, { model: DataWali, as: 'wali' },
                ]
            });
            const wb = new ExcelJS.Workbook();
            const ws1 = wb.addWorksheet('Data Siswa');
            ws1.columns = [{ header: 'Field', key: 'field', width: 25 }, { header: 'Data', key: 'data', width: 45 }];
            ws1.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
            ws1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
            [['Nama Lengkap', siswa.nama_lengkap], ['NISN', siswa.nisn],
            ['Jenis Kelamin', siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
            ['Tempat Lahir', siswa.tempat_lahir], ['Tanggal Lahir', siswa.tanggal_lahir],
            ['Agama', siswa.agama], ['No. Telepon', siswa.no_telp], ['Alamat', siswa.alamat],
            ['Jurusan', siswa.jurusan?.nama_jurusan], ['Rayon', siswa.rayon?.nama_rayon],
            ['Romble', siswa.romble?.nama_romble],
            ['Tahun Ajaran', siswa.TahunAjaran?.nama || '-'],
            ['Semester', siswa.Semester?.nama || '-'],
            ['Status', siswa.approved?.status || 'pending'],
            ].forEach(([field, data]) => ws1.addRow({ field, data: data || '-' }));
            if (keluarga) {
                const ws2 = wb.addWorksheet('Data Keluarga');
                ws2.columns = [{ header: 'Field', key: 'field', width: 25 }, { header: 'Data', key: 'data', width: 45 }];
                ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
                ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
                [['No. KK', keluarga.no_kk], ['Kepala Keluarga', keluarga.nama_kepala_keluarga],
                ['Alamat Keluarga', keluarga.alamat_keluarga], ['--- AYAH ---', ''],
                ['Nama Ayah', keluarga.ayah?.nama_ayah], ['NIK Ayah', keluarga.ayah?.nik_ayah],
                ['Pekerjaan Ayah', keluarga.ayah?.pekerjaan], ['Penghasilan Ayah', keluarga.ayah?.penghasilan],
                ['--- IBU ---', ''], ['Nama Ibu', keluarga.ibu?.nama_ibu], ['NIK Ibu', keluarga.ibu?.nik_ibu],
                ['Pekerjaan Ibu', keluarga.ibu?.pekerjaan], ['Penghasilan Ibu', keluarga.ibu?.penghasilan],
                ].forEach(([field, data]) => ws2.addRow({ field, data: data || '-' }));
            }
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=siswa-${siswa.id}.xlsx`);
            await wb.xlsx.write(res); res.end();
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    exportPDFSingle: async (req, res) => {
        try {
            const uploadDir = path.join(__dirname, '../uploads');
            const siswa = await DataSiswa.findByPk(req.params.id, {
                include: [
                    { model: Jurusan, as: 'jurusan' }, { model: Rayon, as: 'rayon' }, { model: Romble, as: 'romble' },
                    { model: Approved, as: 'approved', attributes: ['status', 'catatan'] },
                    { model: TahunAjaran, as: 'TahunAjaran', attributes: ['nama'] },
                    { model: Semester, as: 'Semester', attributes: ['nama'] },
                ]
            });
            if (!siswa) return res.status(404).json(response(404, "Data siswa tidak ditemukan"));

            // Validasi hak akses sebelum export berkas single
            if (req.user.role === 'user' && siswa.user_id !== req.user.id) return res.status(403).json(response(403, "Forbidden"));
            if (req.user.role === 'admin' && siswa.rayon_id !== req.user.rayon_id) return res.status(403).json(response(403, "Forbidden"));

            const keluarga = await DataKeluarga.findOne({
                where: { siswa_id: siswa.id }, include: [
                    { model: DataAyah, as: 'ayah' }, { model: DataIbu, as: 'ibu' }, { model: DataWali, as: 'wali' },
                ]
            });
            const dokumens = await Dokumen.findAll({ where: { siswa_id: siswa.id } });
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=data-lengkap-${siswa.id}.pdf`);
            doc.pipe(res);
            const ROW = (label, value) => {
                doc.fontSize(10).font('Helvetica-Bold').text(label + ':', 50, doc.y, { continued: true, width: 170 });
                doc.font('Helvetica').text(String(value || '-'), { width: 320 });
            };
            const SECTION = (title) => {
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica-Bold').fillColor('#2563EB').text(title);
                doc.fillColor('black').moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#2563EB').stroke();
                doc.moveDown(0.3);
            };
            // Header
            doc.fontSize(18).font('Helvetica-Bold').text('SIDATA', { align: 'center' });
            doc.fontSize(11).font('Helvetica').text('Sistem Informasi Data Siswa', { align: 'center' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(); doc.moveDown();
            // Foto siswa
            if (siswa.foto) {
                const fp = path.join(uploadDir, siswa.foto);
                if (fs.existsSync(fp)) { try { doc.image(fp, 450, 50, { width: 80, height: 100 }); } catch (e) { } }
            }
            SECTION('DATA SISWA');
            ROW('Nama Lengkap', siswa.nama_lengkap);
            ROW('NISN', siswa.nisn);
            ROW('Jenis Kelamin', siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan');
            ROW('Tempat, Tgl Lahir', `${siswa.tempat_lahir}, ${siswa.tanggal_lahir}`);
            ROW('Agama', siswa.agama);
            ROW('No. Telepon', siswa.no_telp);
            ROW('Alamat', siswa.alamat);
            ROW('Jurusan', siswa.jurusan?.nama_jurusan);
            ROW('Rayon', siswa.rayon?.nama_rayon);
            ROW('Romble', siswa.romble?.nama_romble);
            ROW('Tahun Ajaran', siswa.TahunAjaran?.nama || '-');
            ROW('Semester', siswa.Semester?.nama || '-');
            ROW('Status', siswa.approved?.status || 'pending');
            if (siswa.approved?.catatan) ROW('Catatan', siswa.approved.catatan);
            if (keluarga) {
                SECTION('DATA KELUARGA');
                ROW('No. KK', keluarga.no_kk);
                ROW('Kepala Keluarga', keluarga.nama_kepala_keluarga);
                ROW('Alamat Keluarga', keluarga.alamat_keluarga);
                if (keluarga.ayah) {
                    doc.moveDown(0.3).fontSize(10).font('Helvetica-Bold').fillColor('#374151').text('Data Ayah'); doc.fillColor('black');
                    ROW('Nama', keluarga.ayah.nama_ayah); ROW('NIK', keluarga.ayah.nik_ayah);
                    ROW('Pekerjaan', keluarga.ayah.pekerjaan); ROW('Penghasilan', keluarga.ayah.penghasilan);
                }
                if (keluarga.ibu) {
                    doc.moveDown(0.3).fontSize(10).font('Helvetica-Bold').fillColor('#374151').text('Data Ibu'); doc.fillColor('black');
                    ROW('Nama', keluarga.ibu.nama_ibu); ROW('NIK', keluarga.ibu.nik_ibu);
                    ROW('Pekerjaan', keluarga.ibu.pekerjaan); ROW('Penghasilan', keluarga.ibu.penghasilan);
                }
                if (keluarga.wali) {
                    doc.moveDown(0.3).fontSize(10).font('Helvetica-Bold').fillColor('#374151').text('Data Wali'); doc.fillColor('black');
                    ROW('Nama', keluarga.wali.nama_wali); ROW('Hubungan', keluarga.wali.hubungan);
                    ROW('Pekerjaan', keluarga.wali.pekerjaan);
                }
            }
            SECTION('DOKUMEN');
            const LABEL = { akte_kelahiran: 'Akte Kelahiran', kartu_keluarga: 'Kartu Keluarga', ktp_ayah: 'KTP Ayah', ktp_ibu: 'KTP Ibu' };
            const IMGEXT = ['.jpg', '.jpeg', '.png', '.webp'];
            if (dokumens.length === 0) {
                doc.fontSize(10).font('Helvetica').text('Belum ada dokumen yang diupload');
            } else {
                for (const d of dokumens) {
                    const filename = d.getDataValue('path_file');
                    const fp = path.join(uploadDir, filename || '');
                    const ext = path.extname(filename || '').toLowerCase();
                    doc.fontSize(10).font('Helvetica-Bold').text(LABEL[d.jenis_dokumen] || d.jenis_dokumen);
                    if (IMGEXT.includes(ext) && fs.existsSync(fp)) {
                        try { doc.image(fp, { width: 180, fit: [180, 130] }); } catch (e) { doc.font('Helvetica').text(d.nama_file || filename); }
                    } else {
                        doc.font('Helvetica').text(`${d.nama_file || filename} ${fs.existsSync(fp) ? '✓' : '(tidak ditemukan)'}`);
                    }
                    doc.moveDown(0.3);
                }
            }
            doc.moveDown();
            doc.fontSize(9).fillColor('#6b7280').text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, { align: 'center' });
            doc.end();
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },
};
import CompanyObject from "../modules/company.js"


export const getCompanys = async (req ,res) => {
    try {
        const companys = await CompanyObject.find();
        res.status(200).json(companys)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getCompanyBySearch = async (req ,res) => {
    const {searchQuery} = req.query
    try {
        const title = new RegExp(searchQuery, 'i');
        console.log(title)
        const companys = await CompanyObject.find({ $or: [{ title }] });
        res.json({ data: companys })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const createCompany = async (req ,res) => {
    const company = req.body;
    const newCompany = new CompanyObject(company);
    try {
        await newCompany.save();
        res.status(201).json(newCompany)
    } catch (error) {
        ews.status(409).json({ message: error.message })
    }
}
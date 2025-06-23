const express = require("express");
const Individual = require("../models/individual");
const Consul = require("consul");
const consul = new Consul();
const axios = require("axios");
const{ format,parseISO,differenceInCalendarDays, eachDayOfInterval,parse} = require("date-fns");


const router = express.Router();
// get result by result_test_id

router.get("/get-result/:result_test_id", async (req, res) => {
  const { result_test_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Test');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Test service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address ;
    const servicePort = service.ServicePort;

    console.log(serviceAddress)
    console.log(servicePort)

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/user/get_user_by_id/${result_test_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching user by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});

//get user details by using user _id 
router.get("/get-user-details-by-user-id/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_User');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_User service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address ;
    const servicePort = service.ServicePort;

    console.log(serviceAddress)
    console.log(servicePort)

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/user/get_user_by_id/${user_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching user by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});
 // getting mod id from express_mod by using module_id

 router.get("/get-by-mod-id_express_mod/:module_id", async (req, res) => {
  const { module_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Mod');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/modules/get_module_by_id/${module_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching module by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});


// getting org name by using org_id

router.get("/get_org_by_org_id/:org_id", async (req, res) => {
  const { org_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Mod');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }

    const service = result[0]; // 👈 safer to use 0
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/organization/get_org_by_id/${org_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching organization by organization ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});

//getting poc_name by using poc id
router.get("/get_poc_by_poc_id/:module_poc_id", async (req, res) => {
  const { module_poc_id } = req.params;

  try {
    const result = await consul.catalog.service.nodes('Express_Poc');

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }

    const service = result[0]; // 👈 safer to use 0
    const serviceAddress = service.Address || 'localhost';
    const servicePort = service.ServicePort;

    const response = await axios.get(`http://${serviceAddress}:${servicePort}/poc/get_poc_by_poc_id/${module_poc_id}`);
    res.json(response.data);

  } catch (err) {
    console.error("Error fetching poc by module ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});


// 📝 Create or Update Individual Report



router.post("/post-individual", async (req, res) => {
  try {
    let {
      module_name,
      user_name,
      module_id,
      org_id,
      college_name,
      module_poc_name,
      module_poc_id,
      module_duration,
      user_id,
      result_test_id,
      date,
      result_mcq_score,
      result_coding_score,
      total_mark,
      aggregate_score
    } = req.body;

    const today = format(new Date(), "yyyy-MM-dd");

    // Normalize the input date
    if (!date) {
      date = today;
    } else {
      // Try parsing dd/MM/yyyy, fallback to ISO if needed
      let parsedDate = parse(date, "dd/MM/yyyy", new Date());
      if (isNaN(parsedDate)) parsedDate = parseISO(date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ error: "Invalid test date format" });
      }
      date = format(parsedDate, "yyyy-MM-dd");
    }

    // 🧠 Fetch missing module details if needed
    if (!module_name || !module_duration) {
      const modService = await consul.catalog.service.nodes("Express_Mod");
      if (!modService?.length)
        return res.status(404).json({ error: "Module service not found in Consul" });

      const { ServiceAddress, ServicePort } = modService[0];
      const modResponse = await axios.get(`http://${ServiceAddress}:${ServicePort}/modules/get_module_by_id/${module_id}`);
      const modData = modResponse.data;

      module_name = module_name || modData.mod_name;
      module_duration = module_duration || modData.mod_duration;
    }

    
    if (!college_name) {
      const orgService = await consul.catalog.service.nodes("Express_Mod");
      if (!orgService?.length)
        return res.status(404).json({ error: "Organization service not found in Consul" });
    
      const { ServiceAddress, ServicePort } = orgService[0];
      const orgResponse = await axios.get(`http://${ServiceAddress}:${ServicePort}/organization/get_org_by_id/${org_id}`);
      const orgData = orgResponse.data;
    
      if (!orgData.org_name) {
        return res.status(404).json({ error: "Organization name not found for given module ID" });
      }
    
      college_name = orgData.org_name;
    }
     

    if (!user_name) {
      const usrService = await consul.catalog.service.nodes("Express_User");
      if (!usrService?.length)
        return res.status(404).json({ error: "user service not found in Consul" });
    
      const { ServiceAddress, ServicePort } = usrService[0];
      const usrResponse = await axios.get(`http://${ServiceAddress}:${ServicePort}/user/get_user_by_id/${user_id}`);
      const usrData = usrResponse.data;
    
      if (!usrData.full_name) {
        return res.status(404).json({ error: "full name name not found for given module ID" });
      }
    
      user_name = usrData.full_name;
    }

    // 🧠 Fetch missing POC name if needed
    if (!module_poc_name) {
      const pocService = await consul.catalog.service.nodes("Express_Poc");
      if (!pocService?.length)
        return res.status(404).json({ error: "POC service not found in Consul" });

      const { ServiceAddress, ServicePort } = pocService[0];
      const pocResponse = await axios.get(`http://${ServiceAddress}:${ServicePort}/poc/get_poc_by_poc_id/${module_poc_id}`);
      const pocData = pocResponse.data;

      module_poc_name = pocData.mod_poc_name;
    }

    // ✅ Validate and parse module_duration
    if (!module_duration.includes("-")) {
      return res.status(400).json({ error: "Invalid module_duration format. Expected 'dd/MM/yyyy - dd/MM/yyyy'" });
    }

    const [startStr, endStr] = module_duration.split("-").map(s => s.trim());
    const startDate = parse(startStr, "dd/MM/yyyy", new Date());
    const endDate = parse(endStr, "dd/MM/yyyy", new Date());

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Invalid date in module_duration" });
    }

    const moduleDates = eachDayOfInterval({ start: startDate, end: endDate }).map(d =>
      format(d, "yyyy-MM-dd")
    );

    if (!moduleDates.includes(date)) {
      const testDateFormatted = format(parseISO(date), "dd/MM/yyyy");
    
      // Reformat module_duration to ensure it's in "dd/MM/yyyy - dd/MM/yyyy"
      const startFormatted = format(startDate, "dd/MM/yyyy");
      const endFormatted = format(endDate, "dd/MM/yyyy");
      const readableDuration = `${startFormatted} - ${endFormatted}`;
    
      return res.status(400).json({
        error: `Test date ${testDateFormatted} is not within the module duration (${readableDuration})`
      });
    }
    

    const total_days = moduleDates.length;
    const scored_mark = (Number(result_mcq_score) || 0) + (Number(result_coding_score) || 0);

    const newTest = {
      result_test_id,
      date,
      result_mcq_score: Number(result_mcq_score || 0),
      result_coding_score: Number(result_coding_score || 0),
      scored_mark,
      total_mark: Number(total_mark || 100)
      
    };

    let individual = await Individual.findOne({ user_id });

    if (!individual) {
      const attend_test_days = 1;
      const not_attend_test_days = total_days - attend_test_days;

      individual = new Individual({
        module_name,
        user_name,
        module_id,
        org_id,
        college_name,
        module_poc_name,
        module_poc_id,
        module_duration,
        user_id,
        tests: [newTest],
        details: {
          total_days,
          attend_test_days,
          not_attend_test_days,
          aggregate_score
        }
      });
    } else {
      const alreadyExists = individual.tests.some(test => test.date === date);
      if (alreadyExists) {
        return res.status(400).json({
          message: `Test already exists for user on ${format(parseISO(date), "dd/MM/yyyy")}`
        });
      }

      individual.tests.push(newTest);

      const attendedDates = individual.tests.map(test => test.date);
      const attend_test_days = moduleDates.filter(d => attendedDates.includes(d)).length;
      const not_attend_test_days = total_days - attend_test_days;

      individual.details = {
        total_days,
        attend_test_days,
        not_attend_test_days
      };
    }

    await individual.save();

    res.status(201).json({
      ...individual.toObject(),
      module_name,
      module_poc_name
    }); 

  } catch (err) {
    console.error("Error in post-individual:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
 




  
  

// 📌 Get all reports
router.get("/get-all-individual", async (req, res) => {
  try {
    const reports = await Individual.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get report(s) by user_id
router.get("/get-by-id-individual/:user_id", async (req, res) => {
  try {
    const report = await Individual.findOne({ user_id: req.params.user_id });
    if (!report) return res.status(404).json({ error: "No reports found for this user." });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-by-report-id/:report_id", async (req, res) => {
  try {
    const report = await Individual.findOne({ report_id: req.params.report_id });
    if (!report) return res.status(404).json({ error: "No reports found for this user." });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🛠️ Update a specific test by result_test_id
router.put("/update-individual", async (req, res) => {
  try {
    const {
      user_id,
      result_test_id,
      date,
      result_mcq_score,
      result_coding_score,
      total_mark,
      module_name,
      module_id,
      module_poc_name,
      user_name,
      module_poc_id
    } = req.body;

    const individual = await Individual.findOne({ user_id });
    if (!individual) return res.status(404).json({ error: "User not found" });

    const test = individual.tests.find(t => t.result_test_id === result_test_id);
    if (!test) return res.status(404).json({ error: "Test not found" });

    // If date is changed, check for duplicate and update accordingly
    if (date && date !== test.date) {
      const duplicateDate = individual.tests.some(t => t.date === date);
      if (duplicateDate) {
        return res.status(400).json({ error: `Test already exists for date ${date}` });
      }

      // Adjust details if date changed
      const oldDate = test.date;
      test.date = date;

      const uniqueDates = new Set(individual.tests.map(t => t.date));
      uniqueDates.delete(oldDate);
      uniqueDates.add(date);

      individual.details.attend_test_days = uniqueDates.size;
      individual.details.not_attend_test_days = individual.details.total_days - uniqueDates.size;
    }

    // Update test scores
    test.result_mcq_score = result_mcq_score ?? test.result_mcq_score;
    test.result_coding_score = result_coding_score ?? test.result_coding_score;
    test.total_mark = total_mark ?? test.total_mark;
    test.scored_mark = (test.result_mcq_score || 0) + (test.result_coding_score || 0);

    // Optional top-level updates
    if (module_name) individual.module_name = module_name;
    if (module_id) individual.module_id = module_id;
    if (module_poc_name) individual.module_poc_name = module_poc_name;
    if (module_poc_id) individual.module_poc_id = module_poc_id;
    if (user_name) individual.user_name = user_name;


    await individual.save();
    res.json(individual);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ❌ Delete a test by user_id and result_test_id
router.delete("/delete-test/:user_id/:result_test_id", async (req, res) => {
  try {
    const { user_id, result_test_id } = req.params;

    const individual = await Individual.findOne({ user_id });

    if (!individual) return res.status(404).json({ error: "User not found" });

    const initialLength = individual.tests.length;

    individual.tests = individual.tests.filter(t => t.result_test_id !== result_test_id);

    if (individual.tests.length === initialLength) {
      return res.status(404).json({ error: "Test not found" });
    }

    await individual.save();
    res.json({ message: "Test deleted successfully", updatedReport: individual });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete entire report by user_id
router.delete("/delete-user/:user_id", async (req, res) => {
    try {
      const { user_id } = req.params;
  
      const deleted = await Individual.findOneAndDelete({ user_id });
  
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({ message: `User report with user_id '${user_id}' deleted successfully.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

 


module.exports = router;
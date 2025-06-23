import axios from "axios";

const BASE_URL = "http://localhost:8086";
// const BASE_URL = "https://vw47nbtx-8086.inc1.devtunnels.ms";


// Sign-in API call
export const signIn = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/user_gateway/user/login`, userData);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Get test data by test ID
export const getTestById = async (testId) => {
  try {
    const response = await axios.get(`${BASE_URL}/test_gateway/test/get_by_test_id/${testId}`);
    console.log("Test data fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching test data:", error);
    throw error;
  }
};



// Get MCQ by ID
export const getMcqById = async (mcqId) => {
  try {
    const response = await axios.get(`${BASE_URL}/mcq_gateway/mcq/get_mcq/${mcqId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch MCQ:", error);
    throw error;
  }
};

// Submit test result
export const submitTestResult = async (resultData) => {
  try {
    const response = await axios.post(`${BASE_URL}/mcq_gateway/mcq/submit_result`, resultData);
    return response.data;
  } catch (error) {
    console.error("Error submitting test:", error);
    throw error;
  }
};

// Fetch user details by user ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/user_gateway/user/get_user_by_id/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

// Fetch user results by user ID
export const getResultsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/results_gateway/results/get-result-by-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user results:", error);
    throw error;
  }
};

// Fetch module details by module ID
export const getModuleById = async (modId) => {
  try {
    const response = await axios.get(`${BASE_URL}/modules_gateway/modules/get_module_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module details:", error);
    throw error;
  }
};

// Fetch Result by User ID
export const fetchResultsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/results_gateway/results/get_results_by_user_id/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching result data:", error);
    throw error;
  }
};

export const checkIfTestTaken = async (userId, testId) => {
  try {
    const response = await axios.get(`${BASE_URL}/results_gateway/results/get_result_by_user_id_test_id`, {
      params: {
        result_user_id: userId,
        result_test_id: testId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error checking test result:', error);
    throw error;
  }
};

export const fetchModuleAndPoc = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/mod_and_poc/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module data:", error);
    throw error;
  }
};

export const fetchTestsToday = async (pocId) => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/tests_today/${pocId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching today's tests:", error);
    return { tests_today: [] }; // Changed key to match new endpoint
  }
};

export const fetchExpertName = async (modId) => {
  try {
    const response = await axios.get(`${BASE_URL}/expert_gateway/expert/get_expert_name/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expert name:", error);
    throw error;
  }
};

// Fetch course progress (aggregate scores) by POC ID and User ID
export const fetchAggregateScores = async (pocId, userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/results_gateway/results/aggregate_scores/${pocId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching course progress:", error);
    throw error;
  }
};

export const fetchModuleName = async (modId) => {
  try {
    const response = await axios.get(`${BASE_URL}/modules_gateway/modules/get_module_name_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module name:", error);
    throw error;
  }
};

  export const fetchOrgName = async (modId) => {
    try {
      const response = await axios.get(`${BASE_URL}/organization_gateway/organization/get_org_name_by_id/${modId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching organisation name:", error);
      throw error;
    }
  };



  // FETCH POC BY ID 

  export const fetchPocById = async (pocId) => {
    try {
      const response = await axios.get(`${BASE_URL}/poc_gateway/poc/get_poc_by_poc_id/${pocId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching POC ${pocId}:`, error);
      throw error.response?.data?.message || error.message;
    }
  };

  // FETCH CERTIFICATE STATUS BYY POC ID
  export const fetchPocCertStatus = async (pocId) => {
    try {
      const response = await axios.get(`${BASE_URL}/poc_gateway/poc/get_poc_cert_status/${pocId}`);
      return response.data.cert_status;
    } catch (error) {
      console.error("Error fetching POC certificate status:", error);
      throw error.response?.data?.message || error.message;
    }
  };
  
// FETCH ALL POC

export const fetchAllPocs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/read_all_poc`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch POCs');
  }
};

// FETCH ALL USER 
export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user_gateway/user/read_all_users`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};

// FETCH ALL MODULES
export const fetchAllModules = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/modules_gateway/modules/get_all_module`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch modules');
  }
};

// Update module
export const updateModule = async (payload) => {
  try {
    return await axios.put(`${BASE_URL}/modules_gateway/modules//update_module `, payload);
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

// Delete module
export const deleteModule = async (mod_id) => {
  try {
    return await axios.delete(`${BASE_URL}/modules_gateway/modules/delete_module/${mod_id}`);
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

// FETCH ALL ORGANISATIONS
export const fetchAllOrganizations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/organization_gateway/organization/get_all_org`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch organizations');
  }
};

// FETCH ALL EXPERTS
export const fetchAllExperts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/expert_gateway/expert/read_all_experts`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch experts');
  }
};

// FETCH ALL MCQ
export const fetchAllMcqs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/mcq_gateway/mcq/get_all_mcqs`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch MCQs');
  }
};

// FETCH ALL TESTS
export const fetchAllTests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/test_gateway/test/all`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch tests');
  }
};

// FETCH CODE BY CODE ID 
export const fetchCodeById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/coding_gateway/coding/get_code_by_id/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.msg || "Failed to fetch code");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(`Error fetching code: ${error.message}`);
  }
};

export const fetchTestCaseById = async (testcase_id) => {
  try {
    const response = await axios.get(`${BASE_URL}/testcase_gateway/testcase/get_testCase_id/${testcase_id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching test case: ${error.message}`);
  }
};

export const compileCode = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/coding_gateway/coding/compiler`, payload);
    return response.data;
  } catch (error) {
    throw new Error(`Error compiling code: ${error.message}`);
  }
};

export const generateCertificate = async (mod_poc_id, newUserId) => {
  try {
    const response = await axios.post(`${BASE_URL}/poc_gateway/poc/add-certificate`, {
      mod_poc_id,
      newUserId,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getCertificate = async (mod_poc_id, userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/poc_gateway/poc/get-certificate/${mod_poc_id}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Fetch or generate certificate ID
export const fetchOrGenerateCertificates = async (pocId, userIds) => {
  try {
    // Validate inputs
    if (!pocId || typeof pocId !== "string") {
      throw new Error("mod_poc_id must be a non-empty string");
    }
    const isSingleUser = !Array.isArray(userIds);
    const userIdsArray = isSingleUser ? [userIds] : userIds;
    if (userIdsArray.length === 0 || !userIdsArray.every(id => typeof id === "string" && id)) {
      throw new Error("userIds must be a non-empty string or array of non-empty strings");
    }

    // Log the request URL and body for debugging
    const requestUrl = `${BASE_URL}/poc_gateway/poc/generate-certificates`;
    console.log(`Sending request to: ${requestUrl} with body:`, { mod_poc_id: pocId, userIds: userIdsArray });

    // Send request to POST /generate-certificates
    const response = await axios.post(requestUrl, {
      mod_poc_id: pocId,
      userIds: userIdsArray, // Always send as array
    });

    const data = response.data;
    console.log(`Raw response from ${requestUrl}:`, data); // Debug raw response

    let results, errors;

    // Handle single-user response format
    if (data.certificateId && userIdsArray.length === 1) {
      results = [{
        userId: userIdsArray[0],
        certificateId: data.certificateId,
        message: data.message || "Certificate retrieved successfully",
      }];
      errors = [];
    } else if (data.results && Array.isArray(data.results)) {
      // Handle multi-user response format
      results = data.results;
      errors = data.errors || [];
    } else {
      throw new Error("Invalid response format from generate-certificates: missing results or certificateId");
    }

    // Validate response
    if (!Array.isArray(results) || !Array.isArray(errors)) {
      throw new Error("Invalid response format from generate-certificates: results or errors not arrays");
    }

    // Single user case (string input)
    if (isSingleUser) {
      if (errors.length > 0) {
        throw new Error(errors[0].message || `Failed to fetch/generate certificate for user ${userIds}`);
      }
      if (results.length === 0) {
        throw new Error(`No certificate generated for user ${userIds}`);
      }
      return results[0].certificateId; // Return single certificateId
    }

    // Bulk user case (array input)
    return { results, errors };
  } catch (error) {
    const errorMessage = error.response?.status === 404
      ? `Certificate generation endpoint not found at ${BASE_URL}/poc_gateway/poc/generate-certificates. Please check backend configuration.`
      : error.response?.data?.message || error.message;
    console.error(`Error fetching/generating certificate(s) for poc ${pocId}, user(s) ${userIds}:`, error);
    throw new Error(errorMessage);
  }
};

// Add a new module
export const addModule = async (moduleData) => {
  try {
    const response = await axios.post(`${BASE_URL}/modules_gateway/modules/add_module`, moduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add a new POC
export const addPOC = async (pocData) => {
  try {
    const response = await axios.post(`${BASE_URL}/poc_gateway/poc/add_poc`, pocData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to add POC" };
  }
};

// Add a new expert
export const addExpert = async (expertData) => {
  try {
    const response = await axios.post(`${BASE_URL}/expert_gateway/expert/add_expert`, expertData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { error: "Failed to add expert" };
  }
};

// Add a new Coding problem

export const createCodeProblem = async (problemStatement, tags) => {
  const payload = {
    code_problem_statement: problemStatement,
    code_test_cases_id: [],
    code_tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
  };

  const response = await axios.post(`${BASE_URL}/coding_gateway/coding/add_code`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
};  

// Add a new Testcase
export const createTestCase = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/testcase_gateway/testcase/create_testCase`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Unknown error occurred";
    throw new Error(message);
  }
};

// Get all Code
export const fetchAllCodes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/coding_gateway/coding/get_allCodes`);
    return response.data;
  } catch (error) {
    console.error("Fetch codes error:", error);
    throw error;
  }
};

// Update test API call
export const updateTest = async (testData) => {
  try {
    const response = await axios.put(`${BASE_URL}/testcase_gateway/test/update`, testData);
    return response.data;
  } catch (error) {
    console.error("Update test error:", error);
    throw error;
  }
};

// Update code API call

export const updateCode = async (payload) => {
  try {
    const response = await axios.put(`${BASE_URL}/coding_gateway/coding/update_code`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating code:', error);
    throw error;
  }
};

// fetch all test cases
export const fetchAllTestCases = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/testcase_gateway/testcase/get_all_testCases`);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Failed to fetch test cases"
    );
  }
};

// Create test API call
export const createTest = async (testData) => {
  try {
    console.log('Sending test data:', testData);
    const response = await axios.post(`${BASE_URL}/testcase_gateway/test/create`, testData);
    return response.data;
  } catch (error) {
    console.error("Create test error:", error);
    throw error.response?.data?.error || error.message;
  }
};

// Add users
export const addUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/user_gateway/user/add_user`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("addUser response:", response);
    return response;
  } catch (error) {
    console.error("addUser error:", error.response || error.message);
    throw error;
  }
};

// Bulk add users
export const bulkAddUsers = async (users) => {
  try {
    const response = await axios.post(`${BASE_URL}/user_gateway/user/bulk_add_users`, users, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("bulkAddUsers response:", response);
    return response;
  } catch (error) {
    console.error("bulkAddUsers error:", error.response || error.message);
    throw error;
  }
};

// Update Poc

export const updatePoc = async (updateData) => {
  try {
    const response = await axios.put(`${BASE_URL}/poc_gateway/poc/update_poc`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating POC:', error);
    throw error;
  }
};
// export const updatePoc = async (data) => {
//   try {
//     console.log('Sending update POC request:', data);
//     const response = await axios.put(`${BASE_URL}/poc_gateway/poc/update_poc`, data);
//     console.log('Update POC response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error updating POC:', error);
//     throw error;
//   }
// };

// Update Test
export const updateTestPoc = async (data) => {
  try {
    const response = await axios.put(`${BASE_URL}/poc_gateway/poc/update_test`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update tests');
  }
};

// Update expert
export const updateExpert = async (updateData) => {
  try {
    const response = await axios.put(`${BASE_URL}/expert_gateway/expert/update_expert`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating expert:', error);
    throw error;
  }
};


// Update organization
export const updateOrganization = async (updateData) => {
  try {
    const response = await axios.put(`${BASE_URL}/organization_gateway/organization/update_org_by_id`, updateData);
    return response;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

// Create Organiztion 
export const createOrg = async (orgData) => {
  try {
    const response = await axios.post(`${BASE_URL}/organization_gateway/organization/create_org`, orgData);
    return response.data;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error.response?.data?.message || 'Failed to create organization';
  }
};

// Fetch all student data
export const fetchStudents = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/individual_gateway/individual/get-all-individual`);
    return response.data;
  } catch (err) {
    throw new Error("Failed to fetch student data");
  }
};

// Send student rankings to the server
export const sendStudentRankings = async (pocId, studentNames) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/poc_gateway/poc/generate_report/${pocId}`,
      { student_ranking: studentNames }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error sending student rankings");
  }
};

// Fetch attendance data by module ID and POC ID
export const fetchAttendanceData = async (module_id, module_poc_id) => {
  try {
    const response = await axios.post(`${BASE_URL}/attendance_gateway/attendance/get-by-module-id-and-module-poc-id`, {
      module_id,
      module_poc_id
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch attendance data");
  }
};

// Fetch POC report by POC ID
export const fetchPocReportById = async (mod_poc_id) => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/get_poc_report_by_poc_id/${mod_poc_id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch report details");
  }
};

// Generate/update report by POC ID
export const generateReport = async (mod_poc_id, reportData) => {
  try {
    const response = await axios.put(`${BASE_URL}/poc_gateway/poc/generate_report/${mod_poc_id}`, reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Something went wrong during submission");
  }
};



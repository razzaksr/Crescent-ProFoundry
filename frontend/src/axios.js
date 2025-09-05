import axios from "axios";

const sessionData = JSON.parse(localStorage.getItem("true"));
const token = sessionData?.token;

const BASE_URL = "http://localhost:8086";

// Create Axios instance with default Authorization header
const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
    "Content-Type": "application/json",
  },
});

// Sign-in API call (no token required)
export const signIn = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/login_gateway/login/`, userData);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Get test data by test ID
export const getTestById = async (testId) => {
  try {
    const response = await axiosWithAuth.get(`/test_gateway/test/get_by_test_id/${testId}`);
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
    const response = await axiosWithAuth.get(`/mcq_gateway/mcq/get_mcq/${mcqId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch MCQ:", error);
    throw error;
  }
};

// Submit test result
export const submitTestResult = async (resultData) => {
  try {
    const response = await axiosWithAuth.post(`/results_gateway/results/post-result`, resultData);
    return response.data;
  } catch (error) {
    console.error("Error submitting test:", error);
    throw error;
  }
};

// Fetch user details by user ID
export const getUserById = async (userId) => {
  try {
    const response = await axiosWithAuth.get(`/user_gateway/user/get_user_by_id/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

// Fetch user results by user ID
export const getResultsByUserId = async (userId) => {
  try {
    const response = await axiosWithAuth.get(`/results_gateway/results/get-result-by-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user results:", error);
    throw error;
  }
};

// Fetch module details by module ID
export const getModuleById = async (modId) => {
  try {
    const response = await axiosWithAuth.get(`/modules_gateway/modules/get_module_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module details:", error);
    throw error;
  }
};

// Fetch Result by User ID and POC ID
export const fetchResultsByUserAndPoc = async (userId, pocId) => {
  try {
    const response = await axiosWithAuth.get(`/results_gateway/results/get_results_by_user_and_poc/${userId}/${pocId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching result data:", error);
    throw error;
  }
};

// Check if test is taken
export const checkIfTestTaken = async (userId, testId) => {
  try {
    const response = await axiosWithAuth.get(`/results_gateway/results/get_result_by_user_id_test_id`, {
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

// Fetch POC name by mod_poc_id
export const fetchPocNameById = async (mod_poc_id) => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/get_poc_name_by_id/${mod_poc_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching POC name:", error);
    throw error;
  }
};

// Fetch module and POC data
export const fetchModuleAndPoc = async (userId) => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/mod_and_poc/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module data:", error);
    throw error;
  }
};

// Fetch tests for today
export const fetchTestsToday = async (pocId) => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/tests_today/${pocId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching today's tests:", error);
    return { tests_today: [] };
  }
};

// Fetch expert name
export const fetchExpertName = async (modId) => {
  try {
    const response = await axiosWithAuth.get(`/expert_gateway/expert/get_expert_name/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expert name:", error);
    throw error;
  }
};

// Fetch course progress (aggregate scores)
export const fetchAggregateScores = async (pocId, userId) => {
  try {
    const response = await axiosWithAuth.get(`/results_gateway/results/aggregate_scores/${pocId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course progress:", error);
    throw error;
  }
};

// Fetch module name
export const fetchModuleName = async (modId) => {
  try {
    const response = await axiosWithAuth.get(`/modules_gateway/modules/get_module_name_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module name:", error);
    throw error;
  }
};

// Fetch organization name
export const fetchOrgName = async (modId) => {
  try {
    const response = await axiosWithAuth.get(`/organization_gateway/organization/get_org_name_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching organisation name:", error);
    throw error;
  }
};

// Fetch POC by ID
export const fetchPocById = async (pocId) => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/get_poc_by_poc_id/${pocId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching POC ${pocId}:`, error);
    throw error.response?.data?.message || error.message;
  }
};

// Fetch POC certificate status
export const fetchPocCertStatus = async (pocId) => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/get_poc_cert_status/${pocId}`);
    return response.data.cert_status;
  } catch (error) {
    console.error("Error fetching POC certificate status:", error);
    throw error.response?.data?.message || error.message;
  }
};

// Fetch all POCs
export const fetchAllPocs = async () => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/read_all_poc`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all POCs:", error);
    throw new Error('Failed to fetch POCs');
  }
};

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const response = await axiosWithAuth.get(`/user_gateway/user/read_all_users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error('Failed to fetch users');
  }
};

// Fetch all modules
export const fetchAllModules = async () => {
  try {
    const response = await axiosWithAuth.get(`/modules_gateway/modules/get_all_module`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all modules:", error);
    throw new Error('Failed to fetch modules');
  }
};

// Update module
export const updateModule = async (payload) => {
  try {
    const response = await axiosWithAuth.put(`/modules_gateway/modules/update_module`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating module:", error);
    throw new Error(error.response?.data?.error || error.message);
  }
};

// Delete module
export const deleteModule = async (mod_id) => {
  try {
    const response = await axiosWithAuth.delete(`/modules_gateway/modules/delete_module/${mod_id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting module:", error);
    throw new Error(error.response?.data?.error || error.message);
  }
};

// Fetch all organizations
export const fetchAllOrganizations = async () => {
  try {
    const response = await axiosWithAuth.get(`/organization_gateway/organization/get_all_org`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all organizations:", error);
    throw new Error('Failed to fetch organizations');
  }
};

// Fetch all experts
export const fetchAllExperts = async () => {
  try {
    const response = await axiosWithAuth.get(`/expert_gateway/expert/read_all_experts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all experts:", error);
    throw new Error('Failed to fetch experts');
  }
};

// Fetch all MCQs
export const fetchAllMcqs = async () => {
  try {
    const response = await axiosWithAuth.get(`/mcq_gateway/mcq/get_all_mcqs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all MCQs:", error);
    throw new Error('Failed to fetch MCQs');
  }
};

// Fetch all tests
export const fetchAllTests = async () => {
  try {
    const response = await axiosWithAuth.get(`/test_gateway/test/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all tests:", error);
    throw new Error('Failed to fetch tests');
  }
};

// Fetch code by code ID
export const fetchCodeById = async (id) => {
  try {
    const response = await axiosWithAuth.get(`/coding_gateway/coding/get_code_by_id/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.msg || "Failed to fetch code");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching code:", error);
    throw new Error(`Error fetching code: ${error.message}`);
  }
};

// Fetch test case by ID
export const fetchTestCaseById = async (testcase_id) => {
  try {
    const response = await axiosWithAuth.get(`/testcase_gateway/testcase/get_testCase_id/${testcase_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test case:", error);
    throw new Error(`Error fetching test case: ${error.message}`);
  }
};

// Compile code
export const compileCode = async (payload) => {
  try {
    const response = await axiosWithAuth.post(`/coding_gateway/coding/compiler`, payload);
    return response.data;
  } catch (error) {
    console.error("Error compiling code:", error);
    throw new Error(`Error compiling code: ${error.message}`);
  }
};

// Generate certificate
export const generateCertificate = async (mod_poc_id, newUserId) => {
  try {
    const response = await axiosWithAuth.post(`/poc_gateway/poc/add-certificate`, {
      mod_poc_id,
      newUserId,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get certificate
export const getCertificate = async (mod_poc_id, userId) => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/get-certificate/${mod_poc_id}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching certificate:", error);
    throw error.response ? error.response.data : error;
  }
};

// Fetch or generate certificates
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
    const requestUrl = `/poc_gateway/poc/generate-certificates`;
    console.log(`Sending request to: ${BASE_URL}${requestUrl} with body:`, { mod_poc_id: pocId, userIds: userIdsArray });

    // Send request to POST /generate-certificates
    const response = await axiosWithAuth.post(requestUrl, {
      mod_poc_id: pocId,
      userIds: userIdsArray,
    });

    const data = response.data;
    console.log(`Raw response from ${requestUrl}:`, data);

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

    // Single user case
    if (isSingleUser) {
      if (errors.length > 0) {
        throw new Error(errors[0].message || `Failed to fetch/generate certificate for user ${userIds}`);
      }
      if (results.length === 0) {
        throw new Error(`No certificate generated for user ${userIds}`);
      }
      return results[0].certificateId;
    }

    // Bulk user case
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
    const response = await axiosWithAuth.post(`/modules_gateway/modules/add_module`, moduleData);
    return response.data;
  } catch (error) {
    console.error("Error adding module:", error);
    throw error;
  }
};

// Add a new POC
export const addPOC = async (pocData) => {
  try {
    const response = await axiosWithAuth.post(`/poc_gateway/poc/add_poc`, pocData);
    return response.data;
  } catch (error) {
    console.error("Error adding POC:", error);
    throw error.response?.data || { message: "Failed to add POC" };
  }
};

// Add a new expert
export const addExpert = async (expertData) => {
  try {
    const response = await axiosWithAuth.post(`/expert_gateway/expert/add_expert`, expertData);
    return response.data;
  } catch (error) {
    console.error("Error adding expert:", error);
    throw error.response?.data || { error: "Failed to add expert" };
  }
};

// Add a new coding problem
export const createCodeProblem = async (payload) => {
  try {
    const response = await axiosWithAuth.post(`/coding_gateway/coding/add_code`, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding code problem:", error);
    throw error.response?.data || { message: "Failed to add code problem" };
  }
};

// Add a new test case
export const createTestCase = async (payload) => {
  try {
    const response = await axiosWithAuth.post(`/testcase_gateway/testcase/create_testCase`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating test case:", error);
    throw new Error(error.response?.data?.error || error.message || "Unknown error occurred");
  }
};

// Get all codes
export const fetchAllCodes = async () => {
  try {
    const response = await axiosWithAuth.get(`/coding_gateway/coding/get_allCodes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching codes:", error);
    throw error;
  }
};

// Update test
export const updateTest = async (testData) => {
  try {
    const response = await axiosWithAuth.put(`/testcase_gateway/test/update`, testData);
    return response.data;
  } catch (error) {
    console.error("Error updating test:", error);
    throw error;
  }
};

// Update code
export const updateCode = async (payload) => {
  try {
    const response = await axiosWithAuth.put(`/coding_gateway/coding/update_code`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating code:", error);
    throw error;
  }
};

// Fetch all test cases
export const fetchAllTestCases = async () => {
  try {
    const response = await axiosWithAuth.get(`/testcase_gateway/testcase/get_all_testCases`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test cases:", error);
    throw new Error(error.response?.data?.error || error.message || "Failed to fetch test cases");
  }
};

// Create test
export const createTest = async (testData) => {
  try {
    console.log("Sending test data:", testData);
    const response = await axiosWithAuth.post(`/testcase_gateway/test/create`, testData);
    return response.data;
  } catch (error) {
    console.error("Error creating test:", error);
    throw error.response?.data?.error || error.message;
  }
};

// Add users
export const addUser = async (userData) => {
  try {
    const response = await axiosWithAuth.post(`/user_gateway/user/add_user`, userData);
    console.log("addUser response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Bulk add users
export const bulkAddUsers = async (users) => {
  try {
    const response = await axiosWithAuth.post(`/user_gateway/user/bulk_add_users`, users);
    console.log("bulkAddUsers response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding bulk users:", error);
    throw error;
  }
};

// Add MCQ
export const addMcq = async (mcqData) => {
  try {
    const response = await axiosWithAuth.post(`/mcq_gateway/mcq/add_mcq`, mcqData);
    console.log("addMcq response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding MCQ:", error);
    throw error;
  }
};

// Update POC
export const updatePoc = async (updateData) => {
  try {
    const response = await axiosWithAuth.put(`/poc_gateway/poc/update_poc`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating POC:", error);
    throw error;
  }
};

// Update test POC
export const updateTestPoc = async (data) => {
  try {
    const response = await axiosWithAuth.put(`/poc_gateway/poc/update_test`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating test POC:", error);
    throw new Error(error.response?.data?.message || "Failed to update tests");
  }
};

// Update expert
export const updateExpert = async (updateData) => {
  try {
    const response = await axiosWithAuth.put(`/expert_gateway/expert/update_expert`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating expert:", error);
    throw error;
  }
};

// Update organization
export const updateOrganization = async (updateData) => {
  try {
    const response = await axiosWithAuth.put(`/organization_gateway/organization/update_org_by_id`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
};

// Create organization
export const createOrg = async (orgData) => {
  try {
    const response = await axiosWithAuth.post(`/organization_gateway/organization/create_org`, orgData);
    return response.data;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error.response?.data?.message || "Failed to create organization";
  }
};

// Fetch all student data
export const fetchStudents = async () => {
  try {
    const response = await axiosWithAuth.get(`/individual_gateway/individual/get-all-individual`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student data:", error);
    throw new Error("Failed to fetch student data");
  }
};

// Send student rankings
export const sendStudentRankings = async (pocId, studentNames) => {
  try {
    const response = await axiosWithAuth.put(`/poc_gateway/poc/generate_report/${pocId}`, { student_ranking: studentNames });
    return response.data;
  } catch (error) {
    console.error("Error sending student rankings:", error);
    throw new Error("Error sending student rankings");
  }
};

// Fetch attendance data
export const fetchAttendanceData = async (module_id, module_poc_id) => {
  try {
    const response = await axiosWithAuth.post(`/attendance_gateway/attendance/get-by-module-id-and-module-poc-id`, {
      module_id,
      module_poc_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw new Error("Failed to fetch attendance data");
  }
};

// Fetch POC report by POC ID
export const fetchPocReportById = async (mod_poc_id) => {
  try {
    const response = await axiosWithAuth.get(`/poc_gateway/poc/get_poc_report_by_poc_id/${mod_poc_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report details:", error);
    throw new Error("Failed to fetch report details");
  }
};

// Generate/update report by POC ID
export const generateReport = async (mod_poc_id, reportData) => {
  try {
    const response = await axiosWithAuth.put(`/poc_gateway/poc/generate_report/${mod_poc_id}`, reportData);
    return response.data;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error(error.response?.data?.error || "Something went wrong during submission");
  }
};
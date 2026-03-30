import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OPENAPI_URL = 'http://localhost:8081/api-docs';
const OUTPUT_DIR = 'src/api/generated';

async function generate() {
    console.log('--- Đang tải OpenAPI Spec từ:', OPENAPI_URL);
    
    try {
        // Run generator
        execSync(`npx @openapitools/openapi-generator-cli generate \
            -i ${OPENAPI_URL} \
            -g typescript-axios \
            -o ${OUTPUT_DIR} \
            --additional-properties=useSingleRequestParameter=true,withInterfaces=true`, { stdio: 'inherit' });

        console.log('--- Đã sinh mã thành công tại:', OUTPUT_DIR);

        // Optional: Clean up unnecessary files
        const filesToDelete = ['.gitignore', '.openapi-generator-ignore', 'git_push.sh', 'README.md', '.openapi-generator'];
        filesToDelete.forEach(file => {
            const filePath = path.join(OUTPUT_DIR, file);
            if (fs.existsSync(filePath)) {
                if (fs.lstatSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { recursive: true });
                } else {
                    fs.unlinkSync(filePath);
                }
            }
        });

        console.log('--- Đã dọn dẹp các tệp tin thừa.');
    } catch (error) {
        console.error('--- Lỗi khi sinh mã API:', error.message);
        process.exit(1);
    }
}

generate();

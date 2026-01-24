import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'] || 'system'; // Placeholder for actual auth

        return next.handle().pipe(
            tap((data) => {
                // Here you would implement logic to compare old vs new if needed
                // For now, it captures the action. 
                // In a real scenario, we might use a Subscriber for deeper DB-level auditing.
                console.log(`Audit: User ${userId} performed ${request.method} on ${request.url}`);
            }),
        );
    }
}
